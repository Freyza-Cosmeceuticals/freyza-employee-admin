<script lang="ts">
import Navbar from "$lib/components/resuable/Navbar.svelte"

let { data, children } = $props()
let { supabase } = $derived(data)

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  }
}
</script>

<Navbar />

<main>
  {@render children()}
</main>
