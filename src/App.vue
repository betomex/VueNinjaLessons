<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <!-- <div
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div> -->
    <div class="container">
      <add-ticker @addTicker="addTicker" />

      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />

      <div>
        <button
          v-on:click="currentPage -= 1"
          v-if="currentPage > 1"
          class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Назад
        </button>
        <button
          v-on:click="currentPage += 1"
          v-if="hasNextPage"
          class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Вперёд
        </button>
        <div>Фильтр: <input v-model="filter" type="text" /></div>
      </div>

      <hr class="w-full border-t border-gray-600 my-4" />

      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="t in paginatedTickers"
          v-bind:key="t.id"
          v-bind:class="{
            'border-4': selectedTicker?.id === t.id,
          }"
          v-on:click="handleTickerSelect(t)"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ t.name }} - USD
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatPrice(t.price) }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            v-on:click.stop="handleDelete(t)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path></svg
            >Удалить
          </button>
        </div>
      </dl>

      <hr v-if="tickers.length" class="w-full border-t border-gray-600 my-4" />

      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }}
        </h3>
        <div
          ref="graph"
          class="flex items-end border-gray-600 border-b border-l h-64"
        >
          <div
            v-for="(bar, index) of normalizedGraphData"
            v-bind:key="index"
            v-bind:style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          v-on:click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { subscribeToUpdates, unsubscribeFromUpdates } from "./api";
import AddTicker from "./components/AddTicker.vue";

export default {
  name: "App",
  components: { AddTicker },

  data() {
    return {
      filter: "",

      tickers: [],
      selectedTicker: null,

      graphData: [],
      maxGraphElements: 1,

      currentPage: 1,
    };
  },

  created() {
    const urlParams = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    this.currentPage = urlParams?.currentPage;
    this.filter = urlParams?.filter;

    const tickersData = localStorage.getItem("cryptocurrencies");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToUpdates(ticker.name, (newPrice) =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }
  },

  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },

  computed: {
    startIndex() {
      return (this.currentPage - 1) * 6;
    },

    endIndex() {
      return this.currentPage * 6 - 1;
    },

    urlParams() {
      return {
        currentPage: this.currentPage,
        filter: this.filter,
      };
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.toLowerCase().includes(this.filter?.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex + 1);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex + 1;
    },

    normalizedGraphData() {
      const minValue = Math.min(...this.graphData);
      const maxValue = Math.max(...this.graphData);

      if (minValue === maxValue) {
        return this.graphData.map(() => 50);
      }

      return this.graphData.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
  },

  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return;
      this.maxGraphElements = this.$refs.graph.clientWidth / 38;
    },

    formatPrice(price) {
      if (price === "-") return price;
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    updateTicker(tickerName, price) {
      this.tickers
        .filter((ticker) => ticker.name === tickerName)
        .forEach((ticker) => {
          if (ticker.id === this.selectedTicker?.id) {
            this.graphData.push(price);
            while (this.graphData.length > this.maxGraphElements) {
              this.graphData.shift();
            }
          }
          ticker.price = price;
        });
    },

    addTicker(ticker) {
      const newTicker = {
        id: this.tickers[this.tickers.length - 1]?.id + 1 || 1,
        name: ticker,
        price: "-",
      };
      this.tickers = [...this.tickers, newTicker];
      this.filter = "";

      subscribeToUpdates(newTicker.name, (newPrice) =>
        this.updateTicker(newTicker.name, newPrice)
      );
    },

    handleDelete(tickerToDelete) {
      this.tickers = this.tickers.filter(
        (ticker) => ticker.id !== tickerToDelete.id
      );

      if (tickerToDelete.id === this.selectedTicker.id) {
        this.selectedTicker = null;
      }

      unsubscribeFromUpdates(tickerToDelete.name);
    },

    handleTickerSelect(ticker) {
      this.selectedTicker = ticker;
    },
  },

  watch: {
    tickers() {
      localStorage.setItem("cryptocurrencies", JSON.stringify(this.tickers));
    },

    selectedTicker() {
      this.graphData = [];
      this.$nextTick().then(() => this.calculateMaxGraphElements());
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },

    filter() {
      this.currentPage = 1;
    },

    urlParams(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?currentPage=${value.currentPage}&filter=${value.filter}`
      );
    },
  },
};
</script>
