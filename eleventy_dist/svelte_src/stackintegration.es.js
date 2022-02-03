const p = function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
};
p();
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
  return function(event) {
    event.preventDefault();
    return fn.call(this, event);
  };
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = new Set();
let flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const outroing = new Set();
let outros;
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
function instance$1($$self) {
  var confetti = {
    maxCount: 150,
    speed: 2,
    frameInterval: 15,
    alpha: 1,
    gradient: false,
    start: null,
    stop: null,
    toggle: null,
    pause: null,
    resume: null,
    togglePause: null,
    remove: null,
    isPaused: null,
    isRunning: null
  };
  (function() {
    confetti.start = startConfetti;
    confetti.stop = stopConfetti;
    confetti.toggle = toggleConfetti;
    confetti.pause = pauseConfetti;
    confetti.resume = resumeConfetti;
    confetti.togglePause = toggleConfettiPause;
    confetti.isPaused = isConfettiPaused;
    confetti.remove = removeConfetti;
    confetti.isRunning = isConfettiRunning;
    var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
    var colors = [
      "rgba(30,144,255,",
      "rgba(107,142,35,",
      "rgba(255,215,0,",
      "rgba(255,192,203,",
      "rgba(106,90,205,",
      "rgba(173,216,230,",
      "rgba(238,130,238,",
      "rgba(152,251,152,",
      "rgba(70,130,180,",
      "rgba(244,164,96,",
      "rgba(210,105,30,",
      "rgba(220,20,60,"
    ];
    var streamingConfetti = false;
    var pause = false;
    var lastFrameTime = Date.now();
    var particles = [];
    var waveAngle = 0;
    var context = null;
    function resetParticle(particle, width, height) {
      particle.color = colors[Math.random() * colors.length | 0] + (confetti.alpha + ")");
      particle.color2 = colors[Math.random() * colors.length | 0] + (confetti.alpha + ")");
      particle.x = Math.random() * width;
      particle.y = Math.random() * height - height;
      particle.diameter = Math.random() * 10 + 5;
      particle.tilt = Math.random() * 10 - 10;
      particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
      particle.tiltAngle = Math.random() * Math.PI;
      return particle;
    }
    function toggleConfettiPause() {
      if (pause)
        resumeConfetti();
      else
        pauseConfetti();
    }
    function isConfettiPaused() {
      return pause;
    }
    function pauseConfetti() {
      pause = true;
    }
    function resumeConfetti() {
      pause = false;
      runAnimation();
    }
    function runAnimation() {
      if (pause)
        return;
      else if (particles.length === 0) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      } else {
        var now = Date.now();
        var delta = now - lastFrameTime;
        if (!supportsAnimationFrame || delta > confetti.frameInterval) {
          context.clearRect(0, 0, window.innerWidth, window.innerHeight);
          updateParticles();
          drawParticles(context);
          lastFrameTime = now - delta % confetti.frameInterval;
        }
        requestAnimationFrame(runAnimation);
      }
    }
    function startConfetti(timeout, min, max) {
      var width = window.innerWidth;
      var height = window.innerHeight;
      window.requestAnimationFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
          return window.setTimeout(callback, confetti.frameInterval);
        };
      }();
      var canvas = document.getElementById("confetti-canvas");
      if (canvas === null) {
        canvas = document.createElement("canvas");
        canvas.setAttribute("id", "confetti-canvas");
        canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
        document.body.prepend(canvas);
        canvas.width = width;
        canvas.height = height;
        window.addEventListener("resize", function() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }, true);
        context = canvas.getContext("2d");
      } else if (context === null)
        context = canvas.getContext("2d");
      var count = confetti.maxCount;
      if (min) {
        if (max) {
          if (min == max)
            count = particles.length + max;
          else {
            if (min > max) {
              var temp = min;
              min = max;
              max = temp;
            }
            count = particles.length + (Math.random() * (max - min) + min | 0);
          }
        } else
          count = particles.length + min;
      } else if (max)
        count = particles.length + max;
      while (particles.length < count)
        particles.push(resetParticle({}, width, height));
      streamingConfetti = true;
      pause = false;
      runAnimation();
      if (timeout) {
        window.setTimeout(stopConfetti, timeout);
      }
    }
    function stopConfetti() {
      streamingConfetti = false;
    }
    function removeConfetti() {
      stop();
      pause = false;
      particles = [];
    }
    function toggleConfetti() {
      if (streamingConfetti)
        stopConfetti();
      else
        startConfetti();
    }
    function isConfettiRunning() {
      return streamingConfetti;
    }
    function drawParticles(context2) {
      var particle;
      var x, x2, y2;
      for (var i = 0; i < particles.length; i++) {
        particle = particles[i];
        context2.beginPath();
        context2.lineWidth = particle.diameter;
        x2 = particle.x + particle.tilt;
        x = x2 + particle.diameter / 2;
        y2 = particle.y + particle.tilt + particle.diameter / 2;
        if (confetti.gradient) {
          var gradient = context2.createLinearGradient(x, particle.y, x2, y2);
          gradient.addColorStop("0", particle.color);
          gradient.addColorStop("1.0", particle.color2);
          context2.strokeStyle = gradient;
        } else
          context2.strokeStyle = particle.color;
        context2.moveTo(x, particle.y);
        context2.lineTo(x2, y2);
        context2.stroke();
      }
    }
    function updateParticles() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var particle;
      waveAngle += 0.01;
      for (var i = 0; i < particles.length; i++) {
        particle = particles[i];
        if (!streamingConfetti && particle.y < -15)
          particle.y = height + 100;
        else {
          particle.tiltAngle += particle.tiltAngleIncrement;
          particle.x += Math.sin(waveAngle) - 0.5;
          particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
          particle.tilt = Math.sin(particle.tiltAngle) * 15;
        }
        if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
          if (streamingConfetti && particles.length <= confetti.maxCount)
            resetParticle(particle, width, height);
          else {
            particles.splice(i, 1);
            i--;
          }
        }
      }
    }
  })();
  confetti.start(5e3);
  return [];
}
class Confetti extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, null, safe_not_equal, {});
  }
}
var App_svelte_svelte_type_style_lang = "";
function create_fragment$1(ctx) {
  let h10;
  let t1;
  let h11;
  let t3;
  let confetti;
  let current;
  confetti = new Confetti({});
  return {
    c() {
      h10 = element("h1");
      h10.textContent = "Hi from svelte";
      t1 = space();
      h11 = element("h1");
      h11.textContent = "Hi from svelte";
      t3 = space();
      create_component(confetti.$$.fragment);
      attr(h10, "class", "svelte-9noqbk");
      attr(h11, "class", "svelte-9noqbk");
    },
    m(target, anchor) {
      insert(target, h10, anchor);
      insert(target, t1, anchor);
      insert(target, h11, anchor);
      insert(target, t3, anchor);
      mount_component(confetti, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(confetti.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(confetti.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(h10);
      if (detaching)
        detach(t1);
      if (detaching)
        detach(h11);
      if (detaching)
        detach(t3);
      destroy_component(confetti, detaching);
    }
  };
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment$1, safe_not_equal, {});
  }
}
function create_fragment(ctx) {
  let form;
  let mounted;
  let dispose;
  return {
    c() {
      form = element("form");
      form.innerHTML = `<input type="text" name="fullname" placeholder="Full name"/> 
    <input type="text" name="dob" placeholder="DOB"/> 
    <input type="text" name="emailID" placeholder="EmaiID"/> 
    <input type="submit" value="submit"/>`;
      attr(form, "id", "testform");
    },
    m(target, anchor) {
      insert(target, form, anchor);
      if (!mounted) {
        dispose = listen(form, "submit", prevent_default(ctx[0]));
        mounted = true;
      }
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(form);
      mounted = false;
      dispose();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  const handleSubmit = (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    console.log(formProps);
  };
  return [handleSubmit];
}
class Form extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { handleSubmit: 0 });
  }
  get handleSubmit() {
    return this.$$.ctx[0];
  }
}
new App({
  target: document.getElementById("app")
});
new Form({
  target: document.getElementById("formdiv")
});
