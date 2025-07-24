(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery", "select2"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("jquery"), require("select2"));
  } else {
    factory(jQuery, window.jQuery.fn.select2);
  }
})(function ($, select2) {
  "use strict";

  if (!$.fn.select2) {
    console.error("[LivewireSelect2Adapter] Select2 is not loaded!");
    return;
  }

  var ArrayAdapter = $.fn.select2.amd.require("select2/data/array");

  function LivewireModelAdapter($element, options) {
    // Simpan data existing sebelum memanggil ArrayAdapter
    var self = this;
    this._existingOptions = [];
    $element.find("option").each(function () {
      var $option = $(this);
      self._existingOptions.push({
        id: $option.val(),
        text: $option.text().trim(),
        selected: $option.prop("selected"),
        disabled: $option.prop("disabled"),
        element: this,
      });
    });

    // Panggil konstruktor ArrayAdapter
    ArrayAdapter.call(this, $element, options);

    this._defaultEventName = "select2-results";
    this._defaultEmitName = "select2-query";

    this.livewireConfig = $.extend(
      {
        eventName: this._defaultEventName,
        emitName: this._defaultEmitName,
        eventOnSelect: "model",
        delay: 300,
        version: 3,
      },
      options.get("livewire") || {}
    );

    this._element = $element;
    this._wireModel =
      $element.attr("wire:model") ||
      $element.attr("wire:model.live") ||
      $element.attr("wire:model.defer");

    this._registeredEventName = this.livewireConfig.eventName;
    if (
      this._registeredEventName === this._defaultEventName &&
      this._wireModel
    ) {
      this._registeredEventName += "-" + this._wireModel;
    }

    this._initLivewireListener();
    this._attachLivewireReinit();
  }

  LivewireModelAdapter.prototype = Object.create(ArrayAdapter.prototype);
  LivewireModelAdapter.prototype.constructor = LivewireModelAdapter;

  LivewireModelAdapter.prototype.current = function (callback) {
    var data = [];
    this._element.find(":selected").each(function () {
      var $option = $(this);
      data.push({
        id: $option.val(),
        text: $option.text(),
        selected: true,
      });
    });
    callback(data);
  };

  LivewireModelAdapter.prototype._initLivewireListener = function () {
    var self = this;

    this._eventHandler = function (e) {
      if (self._pendingCallback) {
        // Gabungkan data existing dengan data baru dari Livewire
        var combinedResults = self._existingOptions.concat(
          e.detail.results || []
        );
        self._pendingCallback({
          results: combinedResults,
        });
        self._pendingCallback = null;
      }
    };

    window.addEventListener(this._registeredEventName, this._eventHandler);

    if (self._element.prop("multiple")) {
      //  We dont support yet
      // this._element.on("select2:select", function (e) {
      //   self._handleSelection(e);
      // });
      // this._element.on("select2:unselect", function (e) {
      //   self._handleSelection(e);
      // });
    } else {
      this._element.on("select2:select", function (e) {
        self._handleSelection(e);
      });
    }

    this._observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.removedNodes.forEach(function (node) {
          if (node.contains(self._element[0])) {
            self.destroy();
          }
        });
      });
    });

    this._observer.observe(document.body, { childList: true, subtree: true });
  };

  LivewireModelAdapter.prototype._handleSelection = function (e) {
    var self = this;
    if (self.livewireConfig.eventOnSelect === "model") {
      var model = self._wireModel;
      if (model && window.Livewire) {
        var componentRoot = e.target.closest("[wire\\:id]");
        var componentId = componentRoot
          ? componentRoot.getAttribute("wire:id")
          : null;
        if (componentId) {
          var component = window.Livewire.find(componentId);
          if (component) {
            var isDeferred = !model.includes(".live");
            var value = e.params.data.id;

            if (typeof component.set === "function") {
              // Livewire 3
              component.set(model, value, isDeferred);
            } else if (typeof component.__instance !== "undefined") {
              // Livewire 2
              if (isDeferred) {
                component.__instance.call("deferSet", model, value);
              } else {
                component.__instance.set(model, value, true);
              }
            } else if (typeof component.$wire !== "undefined") {
              // Alternatif untuk Livewire 2
              if (isDeferred) {
                component.$wire.deferSet(model, value);
              } else {
                component.$wire.set(model, value, true);
              }
            }
          }
        }
      }
    } else if (self.livewireConfig.eventOnSelect) {
      if (window.Livewire) {
        if (typeof window.Livewire.dispatch === "function") {
          window.Livewire.dispatch(
            self.livewireConfig.eventOnSelect,
            e.params.data
          );
        } else if (typeof window.Livewire.emit === "function") {
          window.Livewire.emit(
            self.livewireConfig.eventOnSelect,
            e.params.data
          );
        } else {
          console.error(
            "[LivewireSelect2Adapter] Livewire emit/dispatch is not available."
          );
        }
      }
    }
  };

  LivewireModelAdapter.prototype._attachLivewireReinit = function () {
    if (!window.__livewire_select2_reinit_hook_attached) {
      window.__livewire_select2_reinit_hook_attached = true;

      document.addEventListener("livewire:init", function () {
        if (window.Livewire && window.Livewire.hook) {
          window.Livewire.hook("morphed", function () {
            $("[data-select2-livewire]").each(function () {
              var $el = $(this);
              if ($el.data("select2")) {
                var config = $el.data("select2").options.options;
                $el.select2("destroy").select2(config);
              }
            });
          });
        }
      });

      window.addEventListener("livewire:load", function () {
        if (window.Livewire && window.Livewire.hook) {
          window.Livewire.hook("message.processed", function () {
            $("[data-select2-livewire]").each(function () {
              var $el = $(this);
              if ($el.data("select2")) {
                var config = $el.data("select2").options.options;
                $el.select2(config);
              }
            });
          });
        }
      });
    }
  };

  LivewireModelAdapter.prototype.query = function (params, callback) {
    var self = this;
    clearTimeout(this._queryTimeout);

    // Jika pencarian kosong, tampilkan data existing
    if (!params.term || params.term === "") {
      callback({ results: this._existingOptions });
      return;
    }

    this._queryTimeout = setTimeout(function () {
      self._pendingCallback = function (response) {
        callback(response);
        // Setelah menerima hasil, buka dropdown jika tertutup
        setTimeout(function () {
          if (!self._element.data("select2").isOpen()) {
            self._element.select2("open");
          }
        }, 50);
      };

      if (window.Livewire) {
        var emitName = self.livewireConfig.emitName;
        if (emitName === self._defaultEmitName && self._wireModel) {
          emitName += "-" + self._wireModel;
        }

        // Simpan state dropdown sebelum emit
        var isDropdownOpen = self._element.data("select2").isOpen();

        if (typeof window.Livewire.dispatch === "function") {
          window.Livewire.dispatch(emitName, params);
        } else if (typeof window.Livewire.emit === "function") {
          window.Livewire.emit(emitName, params);
        }

        // Jika dropdown tertutup, buka kembali setelah emit
        if (!isDropdownOpen) {
          setTimeout(function () {
            self._element.select2("open");
          }, 100);
        }
      }
    }, this.livewireConfig.delay);
  };

  LivewireModelAdapter.prototype.destroy = function () {
    if (this._eventHandler) {
      window.removeEventListener(this._registeredEventName, this._eventHandler);
      this._eventHandler = null;
    }
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._element) {
      this._element.off("select2:select");
      this._element.off("select2:unselect");
    }
  };

  window.select2 = window.select2 || {};
  window.select2.LivewireModelAdapter = LivewireModelAdapter;
  window.select2.LivewireModelAdapterVersion = "1.2.4";
});
