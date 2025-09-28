<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Login Card Container -->
    <div class="w-1/2 mx-auto px-4 sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3">
      <!-- Enhanced Card -->
      <div class="bg-white rounded-xl shadow-2xl border border-gray-200 relative" style="padding: 15%;">
        <!-- Card Header Border -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
        
        <!-- Logo and Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <Clock class="h-6 w-6 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p class="text-gray-600 text-sm">Sign in to access the Time Manager System</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="email"
              v-model="loginForm.email"
              type="text"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your username"
              :disabled="loading"
            />
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" />
                <EyeOff v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex items-center">
              <AlertCircle class="h-5 w-5 text-red-500 mr-2" />
              <p class="text-red-700 text-sm">{{ error }}</p>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-xs text-gray-500">
            © 2025 Gotham Corp. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { Clock, AlertCircle, Eye, EyeOff } from 'lucide-vue-next';

export default {
  name: 'Login',
  components: {
    Clock,
    AlertCircle,
    Eye,
    EyeOff
  },
  emits: ['login-success'],
  setup(props, { emit }) {
    const loading = ref(false);
    const error = ref('');
    const showPassword = ref(false);
    
    const loginForm = ref({
      email: '',
      password: ''
    });

    // Form validation
    const isFormValid = computed(() => {
      return loginForm.value.email.trim() !== '' && 
             loginForm.value.password.trim() !== '';
    });

    // Handle login - simple validation without backend
    const handleLogin = async () => {
      if (!isFormValid.value) {
        error.value = 'Please fill in all required fields.';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple validation - accept any non-empty credentials
        if (loginForm.value.email.trim() && loginForm.value.password.trim()) {
          // Emit success event with user data
          emit('login-success', {
            email: loginForm.value.email,
            password: loginForm.value.password
          });
        } else {
          throw new Error('Invalid credentials');
        }
        
      } catch (err) {
        error.value = 'Invalid credentials. Please try again.';
        console.error('Login error:', err);
      } finally {
        loading.value = false;
      }
    };

    return {
      loginForm,
      loading,
      error,
      showPassword,
      isFormValid,
      handleLogin
    };
  }
};
</script>

<style scoped>
/* Custom styles for scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Input focus effects */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button hover effects */
button:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* Card hover effect */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
</style>
