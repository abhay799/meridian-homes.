import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(name, react, globals = {}) {
  const source = fs.readFileSync(`src/components/${name}.tsx`, 'utf8');
  const code = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  const exports = {};
  vm.runInNewContext(code, {exports, ...globals, require: (id) => {
    if (id === 'react') return react;
    if (id === 'react/jsx-runtime') return {jsx: (type, props) => ({type, props}), jsxs: (type, props) => ({type, props})};
    if (id === 'react-hook-form') return {useForm: () => ({register: () => ({}), handleSubmit: (fn) => fn, formState: {errors: {}}, reset() {}})};
    return {zodResolver() {}};
  }});
  return exports;
}

test('enquiry waits three seconds and sends the actual mount timestamp', async () => {
  let now = 100000, state = [], index = 0, effect, timer, request;
  const react = {
    useState(initial) {const slot = index++; if (!(slot in state)) state[slot] = initial; return [state[slot], (value) => {state[slot] = value;}];},
    useEffect(fn) {effect = fn;},
  };
  const {EnquiryForm} = load('EnquiryForm', react, {
    Date: {now: () => now},
    setTimeout(fn, delay) {timer = {fn, delay}; return 1;}, clearTimeout() {timer = null;},
    fetch: async (url, options) => {request = JSON.parse(options.body); return {ok: true, json: async () => ({ok: true})};},
  });
  const render = () => {index = 0; return EnquiryForm({});};
  const button = (form) => form.props.children.find((child) => child?.type === 'button');
  let form = render();
  assert.equal(button(form).props.disabled, true);
  const cleanup = effect();
  assert.equal(timer.delay, 3000);
  now += 2999;
  await render().props.onSubmit({});
  assert.equal(request, undefined);
  now += 1;
  timer.fn();
  form = render();
  assert.equal(button(form).props.disabled, false);
  await form.props.onSubmit({});
  assert.equal(request.loaded_at, 100000);
  cleanup();
  assert.equal(timer, null);
});

test('shortlist has an unsaved hydration snapshot, persists and synchronizes subscribers', () => {
  const events = new EventTarget();
  let stored = '["a"]', hooks = [];
  const {ShortlistButton, readShortlist} = load('ShortlistButton', {
    useSyncExternalStore(subscribe, snapshot, serverSnapshot) {hooks.push({subscribe, snapshot, serverSnapshot}); return snapshot();},
  }, {window: events, Event, localStorage: {getItem: () => stored, setItem: (key, value) => {assert.equal(key, 'meridian-shortlist'); stored = value;}}});
  const first = ShortlistButton({id: 'a'}), second = ShortlistButton({id: 'a'});
  assert.equal(first.props['aria-pressed'], true);
  assert.equal(second.props['aria-pressed'], true);
  assert.equal(hooks[0].serverSnapshot(), false);
  let updates = 0;
  const unsubscribe = hooks.map((hook) => hook.subscribe(() => {updates++;}));
  first.props.onClick();
  assert.equal(stored, '[]');
  assert.equal(updates, 2);
  assert.equal(hooks[1].snapshot(), false);
  stored = '["a"]';
  events.dispatchEvent(new Event('storage'));
  assert.equal(updates, 4);
  assert.equal(hooks[1].snapshot(), true);
  unsubscribe.forEach((fn) => fn());
  events.dispatchEvent(new Event('meridian-shortlist-changed'));
  assert.equal(updates, 4);
  stored = 'invalid';
  assert.equal(readShortlist().length, 0);
  stored = '["b", 3, null]';
  assert.equal(JSON.stringify(readShortlist()), '["b"]');
});
