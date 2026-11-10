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

CREATE TABLE refresh_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  remember      BOOLEAN NOT NULL DEFAULT false,
  user_agent    TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL
);
-- ------------------------------------------------------------

-- Categorias --------------------------------------------------

CREATE EXTENSION IF NOT EXISTS ltree;
CREATE TABLE component_categories (
    id                 SERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
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
    path                ltree NOT NULL UNIQUE,
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
    unit_cost           NUMERIC(9)   NOT NULL DEFAULT 0 CHECK(unit_cost >= 0),
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
    cost                 NUMERIC(9)   NOT NULL DEFAULT 0 CHECK(cost >= 0),
    image_url            TEXT,
    manual_url           TEXT,
    category_id          INT REFERENCES tool_categories(id),
    location_id          INT REFERENCES locations(id),
    state                state_tool NOT NULL DEFAULT 'available',
    acquisition_date     DATE,
    description          TEXT,
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
    budget                  NUMERIC(9) NOT NULL DEFAULT 0,
    image_url               TEXT,
    repository_url          TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NULL,
    deleted_at              TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE project_milestones (
    id                      SERIAL PRIMARY KEY,
    project_id              INT REFERENCES projects(id),
    title                   VARCHAR(64) NOT NULL,
    description             VARCHAR(5000),
    is_completed            BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at            TIMESTAMPTZ DEFAULT NULL,
    order_index             INT DEFAULT 0 CHECK(order_index >= 0 AND order_index <= 20),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    planned_amount       INT NOT NULL CHECK(planned_amount >= 0),
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
    'entry',        -- ingresar componentes
    'reserve',      -- reservar para proyecto
    'return',        -- devolucion desde proyecto
    'transfer',     -- cambio de ubicación
    'disposal'      -- componente inutilizable
);

CREATE TABLE stock_movements (
    id                  SERIAL PRIMARY KEY,
    component_id        INT NOT NULL REFERENCES components(id),
    stock_type          stock_movement_type NOT NULL,
    amount              INT NOT NULL CHECK(amount > 0),
    origin_location_id  INT REFERENCES locations(id),
    destination_location_id INT REFERENCES locations(id),
    project_id          INT REFERENCES projects(id),
    user_id             INT REFERENCES users(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stock_movements
ADD CONSTRAINT stock_movements_required_locations
CHECK (
    (stock_type <> 'entry' AND stock_type <> 'disposal'
        OR origin_location_id IS NOT NULL)
    AND (stock_type <> 'reserve' AND stock_type <> 'return'
        OR (origin_location_id IS NOT NULL AND project_id IS NOT NULL))
    AND (stock_type <> 'transfer'
        OR (origin_location_id IS NOT NULL AND destination_location_id IS NOT NULL))
);

--- ===========================================================
-- VISTAS
--- ===========================================================

CREATE MATERIALIZED VIEW mv_component_category_stats AS
SELECT
    c.category_id,
    cc.name AS category_name,
	cc.path AS category_path,
    SUM(c.stock * c.unit_cost) as category_cost,
	COUNT(c.id) as category_stock,
	CASE WHEN SUM(c.stock) > 0 THEN SUM(c.stock * c.unit_cost) / SUM(c.stock) ELSE 0 END AS avg_unit_cost
FROM components c
JOIN component_categories cc ON c.category_id = cc.id
WHERE c.deleted_at IS NULL
GROUP BY c.category_id, cc.name, cc.path;

CREATE MATERIALIZED VIEW mv_tool_category_stats AS
SELECT
    t.category_id,
    tc.name AS category_name,
	tc.path AS category_path,
    COUNT(t.id) as category_stock,
    SUM(t.cost) as category_cost,
    CASE WHEN COUNT(t.id) > 0 THEN SUM(t.cost) / COUNT(t.id) ELSE 0 END AS avg_cost
FROM tools t
JOIN tool_categories tc ON t.category_id = tc.id
WHERE t.deleted_at IS NULL
GROUP BY t.category_id, tc.name, tc.path;

CREATE MATERIALIZED VIEW mv_project_state_stats AS
SELECT
    p.state,
    COUNT(p.id) AS project_count,
    SUM(p.budget) AS total_budget,
    CASE WHEN COUNT(p.id) > 0 THEN SUM(p.budget) / COUNT(p.id) ELSE 0 END AS avg_budget
FROM projects p
WHERE p.deleted_at IS NULL
GROUP BY p.state;

CREATE MATERIALIZED VIEW mv_user_project_state_stats AS
SELECT
	p.responsible_id,
    COUNT(CASE WHEN p.state = 'planning' THEN 1 ELSE null END) AS planning_count,
    COUNT(CASE WHEN p.state = 'active' THEN 1 ELSE null END) AS active_count,
    COUNT(CASE WHEN p.state = 'paused' THEN 1 ELSE null END) AS paused_count,
    COUNT(CASE WHEN p.state = 'completed' THEN 1 ELSE null END) AS completed_count,
    COUNT(CASE WHEN p.state = 'cancelled' THEN 1 ELSE null END) AS cancelled_count,
    SUM(p.budget) AS total_budget,
    CASE WHEN COUNT(p.id) > 0 THEN SUM(p.budget) / COUNT(p.id) ELSE 0 END AS avg_budget
FROM projects p
WHERE p.deleted_at IS NULL
GROUP BY p.responsible_id;

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================

-- Refresh tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

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

CREATE OR REPLACE FUNCTION fn_update_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_type = 'entry' AND NEW.origin_location_id  IS NOT NULL THEN
        UPDATE components
        SET stock = stock + NEW.amount
        WHERE id = NEW.component_id;

        INSERT INTO component_location (component_id, location_id, amount)
        VALUES (NEW.component_id, NEW.origin_location_id, NEW.amount)
        ON CONFLICT (component_id, location_id)
        DO UPDATE SET
            amount = component_location.amount + EXCLUDED.amount;

    ELSIF NEW.stock_type = 'reserve' AND NEW.origin_location_id IS NOT NULL AND NEW.project_id IS NOT NULL THEN
        UPDATE components
        SET stock = stock - NEW.amount
        WHERE id = NEW.component_id;

        UPDATE component_location
        SET amount = amount - NEW.amount
        WHERE component_id = NEW.component_id AND location_id = NEW.origin_location_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock at origin location';
        END IF;

        INSERT INTO project_component (component_id, project_id, planned_amount)
        VALUES (NEW.component_id, NEW.project_id, NEW.amount)
        ON CONFLICT (component_id, project_id)
        DO UPDATE SET
            planned_amount = project_component.planned_amount + EXCLUDED.planned_amount;
    
    ELSIF NEW.stock_type = 'return' AND NEW.origin_location_id IS NOT NULL AND NEW.project_id IS NOT NULL THEN
        UPDATE project_component
        SET planned_amount = planned_amount - NEW.amount
        WHERE component_id = NEW.component_id AND project_id = NEW.project_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'No stock reserved in project';
        END IF;
        
        UPDATE components
        SET stock = stock + NEW.amount
        WHERE id = NEW.component_id;

        INSERT INTO component_location (component_id, location_id, amount)
        VALUES (NEW.component_id, NEW.origin_location_id, NEW.amount)
        ON CONFLICT (component_id, location_id)
        DO UPDATE SET 
            amount = component_location.amount + EXCLUDED.amount;
        
    ELSIF NEW.stock_type = 'disposal' AND NEW.origin_location_id IS NOT NULL THEN
        UPDATE components
        SET stock = stock - NEW.amount
        WHERE id = NEW.component_id;

        UPDATE component_location
        SET amount = amount - NEW.amount
        WHERE component_id = NEW.component_id AND location_id = NEW.origin_location_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock at origin location';
        END IF;

    ELSIF NEW.stock_type = 'transfer' AND NEW.origin_location_id IS NOT NULL AND NEW.destination_location_id IS NOT NULL THEN
        UPDATE component_location
        SET amount = amount - NEW.amount
        WHERE component_id = NEW.component_id AND location_id = NEW.origin_location_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock at origin location';
        END IF;

        INSERT INTO component_location (component_id, location_id, amount)
        VALUES (NEW.component_id, NEW.destination_location_id, NEW.amount)
        ON CONFLICT (component_id, location_id)
        DO UPDATE SET
            amount = component_location.amount + EXCLUDED.amount;
    END IF;

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'An error has ocurred while updating stock: %', SQLERRM; 
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock
    AFTER INSERT ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION fn_update_stock();


CREATE OR REPLACE FUNCTION fn_check_comp_loc_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount = 0 THEN
        DELETE FROM component_location
        WHERE component_id = NEW.component_id AND location_id = NEW.location_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_comp_loc_stock
    AFTER UPDATE OF amount ON component_location
    FOR EACH ROW EXECUTE FUNCTION fn_check_comp_loc_stock();


CREATE OR REPLACE FUNCTION fn_check_proj_comp_stock() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.planned_amount = 0 AND NEW.used_amount = 0 THEN
        DELETE FROM project_component
        WHERE component_id = NEW.component_id AND project_id = NEW.project_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_proj_comp_stock
    AFTER UPDATE OF planned_amount, used_amount ON project_component
    FOR EACH ROW EXECUTE FUNCTION fn_check_proj_comp_stock();

-- Admin users

INSERT INTO users (name, email, passwd, role) VALUES ('Admin User', 'admin@test.com', '$2a$10$BnSyWbV5D8B/aPDBUPwAXedySG/ke/8l4onFDw8m1QITD2XjuAwhi', 'admin');