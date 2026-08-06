<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false
})

useSeoMeta({
  title: 'SokolShop - e-commerce platform portfolio',
  description: 'SokolShop e-commerce platform portfolio: from product management to a customer-facing storefront.'
})
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-slate-950 to-slate-950" />

    <div class="relative mx-auto max-w-6xl px-6 py-6 sm:px-10 lg:px-12">
      <header>
        <NuxtLink
          to="/"
          class="flex items-center gap-3 font-semibold tracking-tight"
        >
          <span class="flex size-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">
            <UIcon
              name="i-lucide-store"
              class="size-5"
            />
          </span>
          <span>SokolShop</span>
        </NuxtLink>
      </header>

      <section class="grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <p class="mb-5 text-sm font-semibold tracking-[0.2em] text-emerald-300 uppercase">
            Open-source e-commerce platform
          </p>
          <h1 class="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            A commerce platform built as an engineering portfolio.
          </h1>
          <p class="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            SokolShop is a full-stack e-commerce project that demonstrates how modern online stores can work, from catalogues and images to a multi-tenant admin console and customer storefronts.
          </p>

          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <UButton
              to="/register"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
              label="Create a store"
            />
            <UButton
              to="/login"
              size="xl"
              color="neutral"
              variant="outline"
              label="Open admin console"
            />
          </div>

          <a
            href="https://github.com/Sokol111/ecommerce-workspace"
            target="_blank"
            rel="noreferrer"
            class="mt-7 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-emerald-300"
          >
            <UIcon
              name="i-lucide-github"
              class="size-4"
            />
            View the workspace on GitHub
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4"
            />
          </a>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div class="flex items-center gap-3 border-b border-white/10 pb-5">
            <span class="size-3 rounded-full bg-rose-400" />
            <span class="size-3 rounded-full bg-amber-300" />
            <span class="size-3 rounded-full bg-emerald-400" />
            <span class="ml-2 text-sm text-slate-400">sokolshop.com</span>
          </div>
          <dl class="mt-6 space-y-5">
            <div>
              <dt class="text-sm text-emerald-300">
                01. Store management
              </dt>
              <dd class="mt-1 text-slate-300">
                Products, categories, attributes, and images managed from one admin console.
              </dd>
            </div>
            <div>
              <dt class="text-sm text-emerald-300">
                02. Independent storefronts
              </dt>
              <dd class="mt-1 text-slate-300">
                Every store runs in its own isolated data space.
              </dd>
            </div>
            <div>
              <dt class="text-sm text-emerald-300">
                03. Modern architecture
              </dt>
              <dd class="mt-1 text-slate-300">
                Go microservices, Kafka events, MongoDB read models, and Nuxt interfaces.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="border-t border-white/10 py-12">
        <div class="grid gap-8 md:grid-cols-3">
          <div>
            <UIcon
              name="i-lucide-layers-3"
              class="mb-4 size-6 text-emerald-300"
            />
            <h2 class="font-semibold">
              More than a mockup
            </h2>
            <p class="mt-2 leading-7 text-slate-400">
              The project demonstrates a working separation of domains, services, and interfaces.
            </p>
          </div>
          <div>
            <UIcon
              name="i-lucide-building-2"
              class="mb-4 size-6 text-emerald-300"
            />
            <h2 class="font-semibold">
              Multi-tenancy
            </h2>
            <p class="mt-2 leading-7 text-slate-400">
              Stores have separate data and administration while running on a shared platform.
            </p>
          </div>
          <div>
            <UIcon
              name="i-lucide-code-2"
              class="mb-4 size-6 text-emerald-300"
            />
            <h2 class="font-semibold">
              Open source
            </h2>
            <p class="mt-2 leading-7 text-slate-400">
              The architecture, infrastructure, and services are available to explore in the GitHub workspace.
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
