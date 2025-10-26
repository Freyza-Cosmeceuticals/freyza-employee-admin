<script lang="ts">
import * as Card from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
</script>

<Card.Root class="w-sm">
  <Card.Header>
    <Card.Title>Admin Login</Card.Title>
    <Card.Description>Login to Freyza Employee Admin</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" action="?/login">
      <div class="flex flex-col gap-6">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" type="email" name="email" required placeholder="email@example.com" />
        </div>

        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a href="##" class="ml-auto inline-block text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" name="password" placeholder="password123" required />
        </div>
      </div>
      <Button type="submit" class="mt-8 w-full">Login</Button>
    </form>
  </Card.Content>
  <!-- <Card.Footer></Card.Footer> -->
</Card.Root>
