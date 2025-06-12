<script setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";

const {locale} = useI18n();
const languages = ref(["en", "es"]);
</script>

<template>
  <pv-select-button v-model="locale" :options="languages" class="uppercase"/>
</template>

<style>

</style>
