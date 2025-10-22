<script lang="ts">
let { data } = $props()
let { supabase, user } = $derived(data)
</script>

<div class="grid place-content-center">
  <h1>Welcome</h1>
  <h2>Private page for user: {user?.email}</h2>
</div>
