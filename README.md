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
<select wire:model="userid" data-placeholder="Select User" data-select2-livewire>
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

Livewire Component Class

```
class User extends Component
{
    public $userid;

    #[On('select2-query-userid')]
    public function getUsers($term = null)
    {
        $this->skipRender();
        $users = User::where('active', 1)->where('name', 'like', '%' . $term . '%')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'text' => $user->name,
                ];
            })
            ->toArray();

        $this->dispatch('select2-results-userid', ['results' => $users]);
    }

    public function updatedUserId($id)
    {
        // Doing some stuff if user is selected
    }

    public function render()
    {
        return view('livewire.user');
    }
}
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
