/**
 * Livewire Select2 Adapter (xdn27)
 * Version: 1.2.2
 * Enables seamless integration between Select2 and Laravel Livewire.
 *
 * @author
 * xdn27 - https://github.com/xdn27
 *
 * @license MIT
 */
(function(n) {
  typeof define == "function" && define.amd ? define(["jquery", "select2"], n) : typeof exports == "object" ? module.exports = n(require("jquery"), require("select2")) : n(jQuery, window.jQuery.fn.select2);
})(function(n, c) {
  if (!n.fn.select2) {
    console.error("[LivewireSelect2Adapter] Select2 is not loaded!");
    return;
  }
  var l = n.fn.select2.amd.require("select2/data/array");
  function r(e, i) {
    l.call(this, e, i), this._defaultEventName = "select2-results", this._defaultEmitName = "select2-query", this.livewireConfig = n.extend(
      {
        eventName: this._defaultEventName,
        emitName: this._defaultEmitName,
        eventOnSelect: "model",
        delay: 300
      },
      i.get("livewire") || {}
    ), this._element = e, this._wireModel = e.attr("wire:model") || e.attr("wire:model.live"), this._registeredEventName = this.livewireConfig.eventName, this._registeredEventName === this._defaultEventName && this._wireModel && (this._registeredEventName += "-" + this._wireModel), this._initLivewireListener(), this._attachLivewireReinit();
  }
  r.prototype = Object.create(l.prototype), r.prototype.constructor = r, r.prototype.current = function(e) {
    var i = [];
    this._element.find(":selected").each(function() {
      var t = n(this);
      i.push({
        id: t.val(),
        text: t.text(),
        selected: !0
      });
    }), e(i);
  }, r.prototype._initLivewireListener = function() {
    var e = this;
    this._eventHandler = function(i) {
      e._pendingCallback && (e._pendingCallback({
        results: i.detail[0].results
      }), e._pendingCallback = null);
    }, window.addEventListener(this._registeredEventName, this._eventHandler), e._element.prop("multiple") || this._element.on("select2:select", function(i) {
      e._handleSelection(i);
    }), this._observer = new MutationObserver(function(i) {
      i.forEach(function(t) {
        t.removedNodes.forEach(function(o) {
          o.contains(e._element[0]) && e.destroy();
        });
      });
    }), this._observer.observe(document.body, { childList: !0, subtree: !0 });
  }, r.prototype._handleSelection = function(e) {
    var i = this;
    if (i.livewireConfig.eventOnSelect === "model") {
      var t = i._wireModel;
      if (t && window.Livewire) {
        var o = e.target.closest("[wire\\:id]"), s = o ? o.getAttribute("wire:id") : null;
        if (s) {
          var a = window.Livewire.find(s);
          if (a) {
            var d = !t.includes(".live"), w = e.params.data.id;
            a.set(t, w, d);
          }
        }
      }
    } else i.livewireConfig.eventOnSelect && window.Livewire && (typeof window.Livewire.dispatch == "function" ? window.Livewire.dispatch(
      i.livewireConfig.eventOnSelect,
      e.params.data
    ) : typeof window.Livewire.emit == "function" ? window.Livewire.emit(
      i.livewireConfig.eventOnSelect,
      e.params.data
    ) : console.error(
      "[LivewireSelect2Adapter] Livewire emit/dispatch is not available."
    ));
  }, r.prototype._attachLivewireReinit = function() {
    window.__livewire_select2_reinit_hook_attached || (window.__livewire_select2_reinit_hook_attached = !0, document.addEventListener("livewire:init", function() {
      window.Livewire && window.Livewire.hook && window.Livewire.hook("morphed", function() {
        n("[data-select2-livewire]").each(function() {
          var e = n(this);
          if (e.data("select2")) {
            var i = e.data("select2").options.options;
            e.select2(i);
          }
        });
      });
    }));
  }, r.prototype.query = function(e, i) {
    var t = this;
    clearTimeout(this._queryTimeout), this._queryTimeout = setTimeout(function() {
      if (t._pendingCallback = i, window.Livewire) {
        var o = t.livewireConfig.emitName;
        o === t._defaultEmitName && t._wireModel && (o += "-" + t._wireModel), typeof window.Livewire.dispatch == "function" ? window.Livewire.dispatch(o, e) : typeof window.Livewire.emit == "function" ? window.Livewire.emit(o, e) : console.error(
          "[LivewireSelect2Adapter] Livewire emit/dispatch is not available."
        );
      } else
        console.error("[LivewireSelect2Adapter] Livewire is not available.");
    }, this.livewireConfig.delay);
  }, r.prototype.destroy = function() {
    this._eventHandler && (window.removeEventListener(this._registeredEventName, this._eventHandler), this._eventHandler = null), this._observer && (this._observer.disconnect(), this._observer = null), this._element && this._element.off("select2:select");
  }, r.prototype.render = function() {
    return l.prototype.render.call(this);
  }, r.prototype.bind = function(e, i) {
    return l.prototype.bind.call(this, e, i);
  }, window.select2 = window.select2 || {}, window.select2.LivewireModelAdapter = r, window.select2.LivewireModelAdapterVersion = "1.2.0";
});
