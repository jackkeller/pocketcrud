<script>
  import { createEventDispatcher } from 'svelte';
  import '../../styles/pocketcrud.css';

  /** @type {string} */
  export let email = '';
  /** @type {string} */
  export let password = '';
  /** @type {boolean} */
  export let isLoading = false;
  /** @type {string} */
  export let error = '';
  /** @type {string} */
  export let title = 'Admin Login';
  /** @type {string} */
  export let subtitle = 'Access the collection management interface';
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
    dispatch('submit', { email, password });
  }
</script>

<div
  class="pocketcrud-login flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
>
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold">{title}</h2>
      <p class="mt-2 text-center">{subtitle}</p>
    </div>

    <form class="pc-form" on:submit={handleSubmit}>
      {#if error}
        <div class="pocketcrud-alert pocketcrud-alert-error" data-testid="error-message">
          {error}
        </div>
      {/if}

      <div class="pc-input-group">
        <slot name="email-input">
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            disabled={isLoading}
            placeholder="Email address"
            class="pocketcrud-input"
            data-testid="email-input"
          />
        </slot>
        <slot name="password-input">
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            disabled={isLoading}
            placeholder="Password"
            class="pocketcrud-input"
            data-testid="password-input"
          />
        </slot>
      </div>

      <div>
        <slot name="submit-button">
          <button
            type="submit"
            disabled={isLoading}
            class="pocketcrud-btn pocketcrud-btn-primary pc-btn-full"
            data-testid="login-button"
          >
            {#if isLoading}
              <span class="pc-loading">
                <div class="pocketcrud-spinner"></div>
                Signing in...
              </span>
            {:else}
              Sign in
            {/if}
          </button>
        </slot>
      </div>

      <div class="pc-links">
        <slot name="back-link">
          <a href={backLink} class="pc-link">{backText}</a>
        </slot>
      </div>
    </form>
  </div>
</div>

<style>
  .pc-form {
    margin-top: var(--pc-spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--pc-spacing-lg);
  }

  .pc-input-group {
    display: flex;
    flex-direction: column;
    gap: var(--pc-spacing-md);
    width: 100%;
  }

  .pc-btn-full {
    width: 100%;
    justify-content: center;
  }

  .pc-loading {
    display: flex;
    align-items: center;
    gap: var(--pc-spacing-sm);
  }

  .pc-links {
    display: flex;
    flex-direction: column;
    gap: var(--pc-spacing-sm);
    text-align: center;
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
</style>
