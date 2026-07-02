create table patients (
  id text primary key,
  name text not null,
  cpf text,
  birth_date date,
  phone text not null,
  city text not null,
  address text,
  status text not null,
  source text,
  notes text,
  created_at timestamptz not null default now()
);

create table appointments (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  type text not null,
  starts_at timestamptz not null,
  audiologist text,
  unit_id text,
  confirmed boolean not null default false,
  notes text
);

create table documents (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  name text not null,
  kind text not null,
  data_url text not null,
  uploaded_at timestamptz not null default now()
);

create table products (
  id text primary key,
  code text not null unique,
  name text not null,
  category text not null,
  price numeric(12,2) not null default 0,
  active boolean not null default true
);

create table units (
  id text primary key,
  city text not null,
  state text not null,
  recipient text,
  company text,
  address text not null,
  cep text,
  active boolean not null default true
);

create table orders (
  id text primary key,
  patient_id text not null references patients(id) on delete cascade,
  unit_id text references units(id),
  order_number text not null,
  payment_condition text,
  invoice_number text,
  invoice_date date,
  status text not null,
  serial_numbers text,
  created_at timestamptz not null default now()
);

create table order_items (
  id text primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text references products(id),
  code text not null,
  description text not null,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  bonus boolean not null default false
);
