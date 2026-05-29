-- ============================================================
-- TABLAS
-- ============================================================

-- Usuario ----------------------------------------------------
CREATE TYPE role_type AS ENUM (
    'admin', 'technician', 'reader'
);

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    passwd      VARCHAR(256) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    role        role_type  NOT NULL DEFAULT 'reader',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NULL,
    deleted_at  TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- Categorias --------------------------------------------------

CREATE EXTENSION IF NOT EXISTS ltree;
CREATE TABLE component_categories (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL UNIQUE,
    path               ltree NOT NULL UNIQUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NULL,
    deleted_at         TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE tool_categories (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
    path               ltree NOT NULL UNIQUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NULL,
    deleted_at         TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- Ubicacion --------------------------------------------------
CREATE TABLE locations (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    path                ltree NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NULL,
    deleted_at          TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- Fabricante -------------------------------------------------
CREATE TABLE manufacturers (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    website     VARCHAR(200),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NULL,
    deleted_at  TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- ============================================================
-- ENTIDADES CORE
-- ============================================================

-- Componente -------------------------------------------------
CREATE TABLE components (
    id                  SERIAL PRIMARY KEY,
    sku                 VARCHAR(20)    NOT NULL UNIQUE,
    name                VARCHAR(200)   NOT NULL,
    description         TEXT,
    category_id         INT REFERENCES component_categories(id),
    manufacturer_id     INT REFERENCES manufacturers(id),
    stock               INT            NOT NULL DEFAULT 0 CHECK(stock >= 0),
    stock_min           INT            NOT NULL DEFAULT 0,
    metric              VARCHAR(20)    NOT NULL DEFAULT '',
    datasheet_url       TEXT,
    image_url           TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NULL,
    deleted_at          TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- Herramienta ------------------------------------------------
CREATE TYPE state_tool AS ENUM (
    'available', 'in_use', 'maintenance', 'disposed', 'lent'
);

CREATE TABLE tools (
    id                   SERIAL PRIMARY KEY,
    sku                  VARCHAR(20) NOT NULL UNIQUE,
    name                 VARCHAR(200) NOT NULL,
    manufacturer_id      INT REFERENCES manufacturers(id),
    model                VARCHAR(100),
    serial_number        VARCHAR(100) UNIQUE,
    image_url            TEXT,
    manual_url           TEXT,
    category_id          INT REFERENCES tool_categories(id),
    location_id          INT REFERENCES locations(id),
    state                state_tool NOT NULL DEFAULT 'available',
    acquisition_date     DATE,
    calibration_required BOOLEAN NOT NULL DEFAULT FALSE,
    next_calibration_date DATE,
    notes                TEXT,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NULL,
    deleted_at           TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- Proyecto ---------------------------------------------------
CREATE TYPE state_project AS ENUM (
    'planning', 'active', 'paused', 'completed', 'cancelled'
);

CREATE TABLE projects (
    id                      SERIAL PRIMARY KEY,
    name                    VARCHAR(200)  NOT NULL,
    description             TEXT,
    state                   state_project NOT NULL DEFAULT 'planning',
    start_date              DATE,
    end_date_estimated      DATE,
    end_date_real           DATE,
    responsible_id          INT REFERENCES users(id),
    budget                  NUMERIC(14,2),
    image_url               TEXT,
    repository_url          TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NULL,
    deleted_at              TIMESTAMPTZ DEFAULT NULL
);
-- ------------------------------------------------------------

-- ============================================================
-- TABLAS PIVOT Y RELACIONES N:M
-- ============================================================

-- Stock por ubicación
CREATE TABLE component_location (
    component_id INT NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    location_id  INT NOT NULL REFERENCES locations(id),
    amount       INT NOT NULL DEFAULT 0 CHECK(amount >= 0),
    PRIMARY KEY(component_id, location_id)
);

-- Componentes requeridos / consumidos por proyecto
CREATE TABLE project_component (
    project_id           INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    component_id         INT NOT NULL REFERENCES components(id),
    planned_amount       INT NOT NULL CHECK(planned_amount > 0),
    used_amount          INT NOT NULL DEFAULT 0,
    notes                TEXT,
    PRIMARY KEY(project_id, component_id)
);

-- Herramientas asignadas / prestadas a proyectos
CREATE TABLE project_tool (
    project_id       INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tool_id          INT NOT NULL REFERENCES tools(id),
    loan_date        TIMESTAMPTZ,
    return_date      TIMESTAMPTZ,
    user_id          INT REFERENCES users(id),
    PRIMARY KEY(project_id, tool_id)
);

-- ============================================================
-- TRAZABILIDAD: MOVIMIENTOS DE STOCK
-- ============================================================
CREATE TYPE stock_movement_type AS ENUM (
    'entry',        -- compra / donación / devolución
    'exit',         -- consumo en proyecto
    'transfer',     -- cambio de ubicación
    'adjustment',   -- corrección de inventario
    'disposal'      -- componente inutilizable
);

CREATE TABLE stock_movements (
    id                  SERIAL PRIMARY KEY,
    component_id        INT NOT NULL REFERENCES components(id),
    stock_type          stock_movement_type NOT NULL,
    amount              INT NOT NULL,
    origin_location_id  INT REFERENCES locations(id),
    destination_location_id INT REFERENCES locations(id),
    project_id          INT REFERENCES projects(id),
    user_id             INT REFERENCES users(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================

-- Búsqueda de componentes por nombre / SKU
CREATE INDEX idx_component_name    ON components(name);
CREATE INDEX idx_component_sku     ON components(sku);
CREATE INDEX idx_component_cat     ON components(category_id);

-- Herramientas por estado y ubicación
CREATE INDEX idx_tool_name    ON tools(name);
CREATE INDEX idx_tool_state    ON tools(state);
CREATE INDEX idx_tool_location ON tools(location_id);

-- Movimientos: filtros más frecuentes
CREATE INDEX idx_stock_movement_comp     ON stock_movements(component_id);
CREATE INDEX idx_stock_movement_date     ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movement_type     ON stock_movements(stock_type);

-- Proyectos por estado y responsable
CREATE INDEX idx_project_state       ON projects(state);
CREATE INDEX idx_project_responsible ON projects(responsible_id);

-- ============================================================
-- TRIGGER: actualizar stock_actual al registrar movimiento
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_component_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW THEN
        UPDATE components

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_update_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_type IN ('entry') AND NEW.component_id  IS NOT NULL THEN
        BEGIN
            UPDATE components
            SET stock = stock + NEW.amount
            WHERE id = NEW.component_id;

            INSERT INTO component_location (component_id, location_id, amount)
            VALUES (NEW.component_id, NEW.origin_location_id, NEW.amount)
            ON CONFLICT (component_id, location_id)
            DO UPDATE SET
                amount = amount + EXCLUDED.amount;
        END;

    ELSIF NEW.stock_type IN ('disposal') AND NEW.component_id IS NOT NULL THEN
        BEGIN
            UPDATE components
            SET stock = stock - NEW.amount
            WHERE id = NEW.component_id;

            INSERT INTO component_location (component_id, location_id, amount)
            VALUES (NEW.component_id, NEW.origin_location_id, 0)
            ON CONFLICT (component_id, location_id)
            DO UPDATE SET
                amount = amount - EXCLUDED.amount;
        END;

    ELSIF NEW.stock_type = 'adjustment' AND NEW.component_id IS NOT NULL THEN
        BEGIN
            UPDATE components
            SET stock = NEW.amount
            WHERE id = NEW.component_id;

            INSERT INTO component_location (component_id, location_id, amount)
            VALUES (NEW.component_id, NEW.origin_location_id, NEW.amount)
            ON CONFLICT (component_id, location_id)
            DO UPDATE SET
                amount = EXCLUDED.amount;
        END;

    ELSIF NEW.stock_type = 'transfer' AND NEW.component_id IS NOT NULL THEN
        BEGIN
            UPDATE component_location
            SET stock = NEW.amount
            WHERE id = NEW.component_id;

            INSERT INTO component_location (component_id, location_id, amount)
            VALUES (NEW.component_id, NEW.origin_location_id, NEW.amount)
            ON CONFLICT (component_id, location_id)
            DO UPDATE SET
                amount = EXCLUDED.amount;
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock
    AFTER INSERT ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION fn_update_stock();

