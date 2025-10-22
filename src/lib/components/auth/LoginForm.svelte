<form method="POST" action="?/login" class="space-y-4">
  <div>
    <label for="email" class="block text-sm font-medium">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      required
      class="mt-1 block w-full rounded-md shadow-sm focus:outline-none"
      placeholder="Enter email"
    />
  </div>

  <div>
    <label for="password" class="block text-sm font-medium">Password</label>
    <input
      type="password"
      id="password"
      name="password"
      required
      class="mt-1 block w-full rounded-md shadow-sm focus:outline-none"
      placeholder="Enter password"
    />
  </div>

  <div class="flex gap-4">
    <button type="submit" class="w-full rounded-md px-4 py-2 focus:outline-none"> Login </button>
  </div>
</form>
