import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import i18n from "@/i18n.js";
import router from '@/router.js';

// PrimeVue components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import MultiSelect from 'primevue/multiselect';
import FileUpload from 'primevue/fileupload';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import Avatar from 'primevue/avatar';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Styles
import '@fontsource/montserrat';
import 'primevue/resources/primevue.min.css';     // core css
import 'primevue/resources/themes/saga-blue/theme.css';     // theme
import 'primeicons/primeicons.css';               // icons
import 'primeflex/primeflex.css';                 // primeflex

const app = createApp(App);

// Use plugins
app.use(PrimeVue, {
    ripple: true,
    inputStyle: "filled"
});
app.use(ToastService);
app.use(router);
app.use(i18n);

// Register components
app.component('Button', Button);
app.component('InputText', InputText);
app.component('SelectButton', SelectButton);
app.component('MultiSelect', MultiSelect);
app.component('FileUpload', FileUpload);
app.component('InputNumber', InputNumber);
app.component('Toast', Toast);
app.component('Dialog', Dialog);
app.component('Avatar', Avatar);
app.component('Textarea', Textarea);
app.component('Chip', Chip);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Dropdown', Dropdown);
app.component('Slider', Slider);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Checkbox', Checkbox);

app.mount('#app');