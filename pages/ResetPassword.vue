<template>
  <div id="reset-password">
    <SfHeading
      :title="$t('Reset Password')"
      :level="3"
      class="heading sf-heading--no-underline"
    />
    <div v-if="!isPasswordChanged">
      <ValidationObserver
        v-slot="{ handleSubmit }"
        key="log-in"
      >
        <form
          class="form"
          @submit.prevent="handleSubmit(setNewPassword)"
        >
          <ValidationProvider
            v-slot="{ errors }"
            rules="required|email"
          >
            <SfInput
              v-model="form.email"
              v-e2e="'login-modal-email'"
              :valid="!errors[0]"
              :error-message="errors[0]"
              name="email"
              label="Your email"
              class="form__element"
            />
          </ValidationProvider>
          <ValidationProvider
            v-slot="{ errors }"
            rules="required|password"
          >
            <SfInput
              v-model="form.password"
              v-e2e="'reset-password-modal-password'"
              :valid="!errors[0]"
              :error-message="errors[0]"
              :label="$t('Password')"
              name="password"
              type="password"
              class="form__element"
            />
          </ValidationProvider>
          <ValidationProvider
            v-slot="{ errors }"
            rules="required"
          >
            <SfInput
              v-model="form.repeatPassword"
              v-e2e="'reset-password-modal-password-repeat'"
              :valid="!errors[0]"
              :error-message="errors[0]"
              :label="$t('Repeat Password')"
              name="repeat-password"
              type="password"
              class="form__element"
            />
          </ValidationProvider>
          <div v-if="passwordMatchError || forgotPasswordError.setNew">
            {{ passwordMatchError || forgotPasswordError.setNew.message }}
          </div>
          <SfButton
            v-e2e="'reset-password-modal-submit'"
            type="submit"
            class="sf-button--full-width form__button"
            :disabled="forgotPasswordLoading"
          >
            <SfLoader
              :class="{ loader: forgotPasswordLoading }"
              :loading="forgotPasswordLoading"
            >
              <div>{{ $t('Save Password') }}</div>
            </SfLoader>
          </SfButton>
        </form>
      </ValidationObserver>
    </div>
    <div v-else>
      <p>{{ $t('Password Changed') }}</p>
      <SfButton
        class="sf-button"
        link="/"
      >
        {{ $t('Back to home') }}
      </SfButton>
    </div>
  </div>
</template>
<script>
import {
  SfButton,
  SfLoader,
  SfInput,
  SfHeading,
} from '@storefront-ui/vue';
import { ref, computed } from '@vue/composition-api';
import { useForgotPassword, forgotPasswordGetters } from '@vue-storefront/magento';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { email, required } from 'vee-validate/dist/rules';

extend('email', {
  ...email,
  message: 'Invalid email',
});

extend('required', {
  ...required,
  message: 'This field is required',
});

extend('password', {
  message: 'The password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and one special character (E.g. , . _ & ? etc)',
  validate: (value) => {
    const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])(?=.{8,})');
    return strongRegex.test(value);
  },
});

export default {
  name: 'ResetPassword',
  components: {
    SfButton,
    SfHeading,
    SfLoader,
    SfInput,
    ValidationProvider,
    ValidationObserver,
  },
  middleware({ redirect, route }) {
    if (!route.query.token) {
      return redirect('/');
    }
  },
  setup(props, context) {
    const {
      result,
      setNew,
      error: forgotPasswordError,
      loading: forgotPasswordLoading,
    } = useForgotPassword();
    const passwordMatchError = ref(false);
    const form = ref({});
    const isPasswordChanged = computed(() => forgotPasswordGetters.isPasswordChanged(result.value));

    const { token } = context.root.$route.query;

    const setNewPassword = async () => {
      passwordMatchError.value = false;
      if (form.value.password !== form.value.repeatPassword) {
        passwordMatchError.value = 'Passwords do not match';
        return;
      }

      await setNew({
        tokenValue: token,
        newPassword: form.value.password,
        email: form.value.email,
      });
    };

    return {
      isPasswordChanged,
      form,
      setNewPassword,
      forgotPasswordLoading,
      forgotPasswordError,
      passwordMatchError,
      token,
      result,
    };
  },
};
</script>

<style lang="scss" scoped>
#reset-password {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding: 0 var(--spacer-sm);
  margin: var(--spacer-xl) 0;
  @include for-desktop {
    max-width: 77.5rem;
  }
}

.form {
  margin-top: var(--spacer-sm);
  min-width: 350px;
  &__element {
    margin: 0 0 var(--spacer-xl) 0;
  }
}
.action {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacer-xl) 0 var(--spacer-xl) 0;
  font: var(--font-weight--light) var(--font-size--base) / 1.6 var(--font-family--secondary);
  & > * {
    margin: 0 0 0 var(--spacer-xs);
  }
}
.action {
  margin: var(--spacer-xl) 0 var(--spacer-xl) 0;
}
.checkbox {
  margin-bottom: var(--spacer-2xl);
}
.bottom {
  text-align: center;
  margin-bottom: var(--spacer-lg);
  font-size: var(--h3-font-size);
  font-weight: var(--font-weight--semibold);
  font-family: var(--font-family--secondary);
  &__paragraph {
    color: var(--c-primary);
    margin: 0 0 var(--spacer-base) 0;
    @include for-desktop {
      margin: 0;
    }
  }
}
</style>
