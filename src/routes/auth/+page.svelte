<script>
import LoginForm from "@/components/auth/LoginForm.svelte"
</script>

<svelte:head>
  <title>Admin Login | Freyza Cosmeceuticals Employee System</title>
  <meta name="description" content="Admin Login page for Freyza Cosmeceuticals Employee System" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
  <div class="w-96 rounded-lg p-8 shadow-md">
    <h2 class="mb-12 text-center font-bold">Admin Login</h2>
    <LoginForm />
  </div>
</div>
