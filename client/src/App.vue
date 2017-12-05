<template>
  <div id="app">
    <v-app>
      <main>
          <router-view></router-view>
      </main>
    </v-app>
  </div>
</template>

<script>
import Register from '@/components/register';

export default {
  name: 'app',
  components: {
    Register,
  },
};
</script>

