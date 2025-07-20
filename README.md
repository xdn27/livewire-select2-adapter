# Livewire Select2 Adapter

Seamless integration between [Laravel Livewire](https://laravel.livewire.com) and [Select2](https://select2.org) without hassle.

### Features

✅ Seamless Select2 and Livewire integration
✅ Supports `wire:model` and `wire:model.live`
✅ Customizable event names for queries and results
✅ Auto re-initialize after Livewire morphs
✅ Works with Livewire v3 and Select2 v4
✅ Lightweight and dependency-free (except Select2 and jQuery)

---

### Installation

Download the script or use CDN in your HTML:

```
<script src="https://cdn.jsdelivr.net/npm/livewire-select2-adapter/dist/livewire-select2-adapter.umd.js"></script>
```

Or install using npm:

```
npm install livewire-select2-adapter
```

---

### Usage

Blade Component

```
<select wire:model="selectedUser" data-select2-livewire>
	<option value="">Select User</option>
	@foreach($users as $user)
		<option value="{{ $user->id }}">{{ $user->name }}</option>
	@endforeach
</select>
```

JavaScript Initialization

```
$(document).ready(function() {
	$('[data-select2-livewire]').select2({
		theme: 'bootstrap4',
		width: '100%',
	});
});
```

The adapter will automatically handle Livewire morphing and syncing with `wire:model`.

---

### Configuration

You can customize Livewire behavior via:

```
$('[data-select2-livewire]').select2({
	livewire: {
		eventName: 'select2-results-{wireModelName}', // default
		emitName: 'select2-query-{wireModelName}', // default
		eventOnSelect: 'model', // or custom event name
		delay: 300 // debounce delay in ms
	}
});
```

###

“Happy coding guys!”
