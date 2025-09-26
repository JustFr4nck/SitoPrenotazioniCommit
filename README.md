# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

#
```

## Production

Build the application for production:

```bash
# npm
npm run build

```

Locally preview production build:

```bash
# npm
npm run preview

```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Configurazione Supabase

Se installi questo progetto su un nuovo account Supabase, devi creare la tabella `prenotazioni` nel database. Puoi farlo eseguendo la seguente query SQL nella sezione SQL editor di Supabase:

```sql
create table public.prenotazioni (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  "startDate" timestamp with time zone not null,
  "endDate" timestamp with time zone not null,
  room text not null,
  email text not null,
  constraint prenotazioni_pkey primary key (id)
) TABLESPACE pg_default;
```