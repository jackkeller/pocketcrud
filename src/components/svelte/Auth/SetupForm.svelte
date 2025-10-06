<script>
  import { createEventDispatcher } from 'svelte';
  import '../../styles/pocketcrud.css';

  /** @type {string} */
  export let email = '';
  /** @type {string} */
  export let password = '';
  /** @type {string} */
  export let passwordConfirm = '';
  /** @type {boolean} */
  export let isLoading = false;
  /** @type {string} */
  export let error = '';
  /** @type {string} */
  export let success = '';
  /** @type {string} */
  export let title = 'Admin Setup';
  /** @type {string} */
  export let subtitle = 'Create an admin user to access the collection management interface';
  /** @type {number} */
  export let minPasswordLength = 10;
  /** @type {string} */
  export let loginLink = '/admin/login';
  /** @type {string} */
  export let loginText = 'Already have admin account? Sign in';
  /** @type {string} */
  export let backLink = '/';
  /** @type {string} */
  export let backText = '← Back to site';

  const dispatch = createEventDispatcher();

  /**
   * @param {Event} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    dispatch('submit', { email, password, passwordConfirm });
  }
</script>

<div class="pocketcrud-setup flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold">{title}</h2>
      <p class="mt-2 text-center">{subtitle}</p>
    </div>

    <form class="mt-8 space-y-6" on:submit={handleSubmit}>
      {#if error}
        <div class="pocketcrud-alert pocketcrud-alert-error" data-testid="error-message">
          {error}
        </div>
      {/if}

      {#if success}
        <div class="pocketcrud-alert pocketcrud-alert-success" data-testid="success-message">
          {success}
        </div>
      {/if}

      <div class="space-y-4">
        <slot name="email-input">
          <div>
            <label for="email" class="block text-sm font-medium">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              bind:value={email}
              disabled={isLoading}
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Enter admin email"
              data-testid="email-input"
            />
          </div>
        </slot>

        <slot name="password-input">
          <div>
            <label for="password" class="block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              bind:value={password}
              disabled={isLoading}
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Enter password (min {minPasswordLength} characters)"
              data-testid="password-input"
            />
          </div>
        </slot>

        <slot name="password-confirm-input">
          <div>
            <label for="passwordConfirm" class="block text-sm font-medium">Confirm Password</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autocomplete="new-password"
              required
              bind:value={passwordConfirm}
              disabled={isLoading}
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Confirm password"
              data-testid="password-confirm-input"
            />
          </div>
        </slot>
      </div>

      <div>
        <slot name="submit-button">
          <button
            type="submit"
            disabled={isLoading}
            class="pocketcrud-btn pocketcrud-btn-primary pc-btn-full"
            data-testid="setup-button"
          >
            {#if isLoading}
              <span class="pc-loading">
                <div class="pocketcrud-spinner"></div>
                Creating Admin...
              </span>
            {:else}
              Create Admin User
            {/if}
          </button>
        </slot>
      </div>

      <div class="space-y-2 text-center">
        <slot name="login-link">
          <a href={loginLink} class="pc-link">
            {loginText}
          </a>
        </slot>
        <br />
        <slot name="back-link">
          <a href={backLink} class="pc-link-secondary">{backText}</a>
        </slot>
      </div>
    </form>

    <slot name="instructions">
      <div class="pocketcrud-alert pocketcrud-alert-warning pc-instructions">
        <h3 class="pc-instructions-title">Setup Instructions</h3>
        <div class="pc-instructions-body">
          <p>
            This will create a new admin user in your PocketBase instance. The admin user will have full access to the
            collection management interface.
          </p>
          <p class="mt-2">
            <strong>Note:</strong> You only need to do this once. After the admin user is created, you can log in normally.
          </p>
        </div>
      </div>
    </slot>
  </div>
</div>

<style>
  .pc-btn-full {
    width: 100%;
    justify-content: center;
  }

  .pc-loading {
    display: flex;
    align-items: center;
    gap: var(--pc-spacing-sm);
  }

  .pc-link {
    font-size: var(--pc-font-size-sm);
    color: var(--pc-primary);
    text-decoration: none;
    transition: color var(--pc-transition-speed) var(--pc-transition-timing);
  }

  .pc-link:hover {
    color: var(--pc-primary-hover);
  }

  .pc-link-secondary {
    font-size: var(--pc-font-size-sm);
    color: var(--pc-text-secondary);
    text-decoration: none;
    transition: color var(--pc-transition-speed) var(--pc-transition-timing);
  }

  .pc-link-secondary:hover {
    color: var(--pc-text-muted);
  }

  .pc-instructions {
    margin-top: var(--pc-spacing-xl);
  }

  .pc-instructions-title {
    font-size: var(--pc-font-size-sm);
    font-weight: 500;
  }

  .pc-instructions-body {
    margin-top: var(--pc-spacing-sm);
    font-size: var(--pc-font-size-sm);
  }
</style>
