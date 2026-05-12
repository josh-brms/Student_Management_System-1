-- ============================================================
--  Student Task Management System (STMS)
--  Supabase-Compatible Schema — PostgreSQL
--  CSPC 321 Software Engineering · Divine Word College of Legazpi
--
--  HOW TO USE:
--  1. Supabase Dashboard → SQL Editor → New Query
--  2. Paste this entire file and click Run
-- ============================================================

-- Clean slate (safe re-runs)
DROP TABLE IF EXISTS audit_logs       CASCADE;
DROP TABLE IF EXISTS notifications    CASCADE;
DROP TABLE IF EXISTS task_tags        CASCADE;
DROP TABLE IF EXISTS tags             CASCADE;
DROP TABLE IF EXISTS attachments      CASCADE;
DROP TABLE IF EXISTS task_comments    CASCADE;
DROP TABLE IF EXISTS tasks            CASCADE;
DROP TABLE IF EXISTS subjects         CASCADE;
DROP TABLE IF EXISTS user_sessions    CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

DROP TYPE IF EXISTS user_role       CASCADE;
DROP TYPE IF EXISTS task_type       CASCADE;
DROP TYPE IF EXISTS task_priority   CASCADE;
DROP TYPE IF EXISTS task_status     CASCADE;
DROP TYPE IF EXISTS notif_type      CASCADE;

-- ============================================================
--  ENUM Types
-- ============================================================
CREATE TYPE user_role     AS ENUM ('student', 'admin');
CREATE TYPE task_type     AS ENUM ('assignment', 'quiz', 'project');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_status   AS ENUM ('pending', 'ongoing', 'done');
CREATE TYPE notif_type    AS ENUM ('reminder', 'status_change', 'system');

-- ============================================================
--  1. USERS
--  NOTE: password_hash is stored as 'managed_by_supabase_auth'
--  since Supabase Auth handles actual authentication.
-- ============================================================
CREATE TABLE users (
    user_id        SERIAL          PRIMARY KEY,
    name           VARCHAR(100)    NOT NULL,
    email          VARCHAR(150)    NOT NULL UNIQUE,
    password_hash  VARCHAR(255)    NOT NULL DEFAULT 'managed_by_supabase_auth',
    role           user_role       NOT NULL DEFAULT 'student',
    avatar_url     VARCHAR(500),
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ============================================================
--  2. USER_SESSIONS (optional — Supabase manages JWTs,
--     but kept for audit/tracking purposes)
-- ============================================================
CREATE TABLE user_sessions (
    session_id  SERIAL        PRIMARY KEY,
    user_id     INT           NOT NULL,
    token       VARCHAR(255)  NOT NULL UNIQUE,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(255),
    expires_at  TIMESTAMPTZ   NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_sessions_token   ON user_sessions (token);

-- ============================================================
--  3. SUBJECTS
-- ============================================================
CREATE TABLE subjects (
    subject_id       SERIAL        PRIMARY KEY,
    user_id          INT           NOT NULL,
    name             VARCHAR(100)  NOT NULL,
    code             VARCHAR(20),
    color_hex        CHAR(7)       NOT NULL DEFAULT '#6366F1',
    instructor_name  VARCHAR(100),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_subjects_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_subjects_user_id ON subjects (user_id);

-- ============================================================
--  4. TASKS
-- ============================================================
CREATE TABLE tasks (
    task_id       SERIAL          PRIMARY KEY,
    user_id       INT             NOT NULL,
    subject_id    INT,
    title         VARCHAR(200)    NOT NULL,
    description   TEXT,
    type          task_type       NOT NULL,
    priority      task_priority   NOT NULL DEFAULT 'medium',
    status        task_status     NOT NULL DEFAULT 'pending',
    due_date      DATE            NOT NULL,
    is_deleted    BOOLEAN         NOT NULL DEFAULT FALSE,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_tasks_subject
        FOREIGN KEY (subject_id) REFERENCES subjects (subject_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_tasks_user_id    ON tasks (user_id);
CREATE INDEX idx_tasks_subject_id ON tasks (subject_id);
CREATE INDEX idx_tasks_status     ON tasks (status);
CREATE INDEX idx_tasks_due_date   ON tasks (due_date);
CREATE INDEX idx_tasks_is_deleted ON tasks (is_deleted);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  5. TASK_COMMENTS
-- ============================================================
CREATE TABLE task_comments (
    comment_id  SERIAL        PRIMARY KEY,
    task_id     INT           NOT NULL,
    user_id     INT           NOT NULL,
    content     TEXT          NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comments_task
        FOREIGN KEY (task_id) REFERENCES tasks (task_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_comments_task_id ON task_comments (task_id);
CREATE INDEX idx_comments_user_id ON task_comments (user_id);

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
--  6. ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
    attachment_id  SERIAL        PRIMARY KEY,
    task_id        INT           NOT NULL,
    user_id        INT           NOT NULL,
    file_name      VARCHAR(255)  NOT NULL,
    file_url       VARCHAR(500)  NOT NULL,
    file_type      VARCHAR(100),
    file_size_kb   INT,
    uploaded_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_attachments_task
        FOREIGN KEY (task_id) REFERENCES tasks (task_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_attachments_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_attachments_task_id ON attachments (task_id);
CREATE INDEX idx_attachments_user_id ON attachments (user_id);

-- ============================================================
--  7. TAGS
-- ============================================================
CREATE TABLE tags (
    tag_id     SERIAL       PRIMARY KEY,
    user_id    INT          NOT NULL,
    name       VARCHAR(50)  NOT NULL,
    color_hex  CHAR(7)      NOT NULL DEFAULT '#94A3B8',
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT uq_tags_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags (user_id);

-- ============================================================
--  8. TASK_TAGS (junction)
-- ============================================================
CREATE TABLE task_tags (
    task_id  INT NOT NULL,
    tag_id   INT NOT NULL,

    PRIMARY KEY (task_id, tag_id),

    CONSTRAINT fk_tasktags_task
        FOREIGN KEY (task_id) REFERENCES tasks (task_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_tasktags_tag
        FOREIGN KEY (tag_id) REFERENCES tags (tag_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
--  9. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    notification_id  SERIAL        PRIMARY KEY,
    user_id          INT           NOT NULL,
    task_id          INT,
    message          VARCHAR(500)  NOT NULL,
    type             notif_type    NOT NULL DEFAULT 'system',
    is_read          BOOLEAN       NOT NULL DEFAULT FALSE,
    scheduled_at     TIMESTAMPTZ,
    sent_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_notif_task
        FOREIGN KEY (task_id) REFERENCES tasks (task_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_notif_user_id ON notifications (user_id);
CREATE INDEX idx_notif_task_id ON notifications (task_id);
CREATE INDEX idx_notif_is_read ON notifications (is_read);

-- ============================================================
--  10. AUDIT_LOGS
-- ============================================================
CREATE TABLE audit_logs (
    log_id         SERIAL        PRIMARY KEY,
    user_id        INT,
    task_id        INT,
    action         VARCHAR(20)   NOT NULL,
    field_changed  VARCHAR(100),
    old_value      TEXT,
    new_value      TEXT,
    ip_address     VARCHAR(45),
    changed_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_audit_task
        FOREIGN KEY (task_id) REFERENCES tasks (task_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_audit_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_task_id ON audit_logs (task_id);
CREATE INDEX idx_audit_action  ON audit_logs (action);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
--  Uses email to bridge Supabase Auth ↔ public.users
-- ============================================================
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's row from public.users
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS INT AS $$
  SELECT user_id FROM users WHERE email = auth.email() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE email = auth.email() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- USERS
CREATE POLICY "users: read own"       ON users FOR SELECT USING (email = auth.email());
CREATE POLICY "users: admin read all" ON users FOR SELECT USING (current_user_role() = 'admin');
CREATE POLICY "users: update own"     ON users FOR UPDATE USING (email = auth.email());
CREATE POLICY "users: admin update"   ON users FOR UPDATE USING (current_user_role() = 'admin');
CREATE POLICY "users: insert"         ON users FOR INSERT WITH CHECK (true); -- allow signup insert

-- SUBJECTS
CREATE POLICY "subjects: own"         ON subjects FOR ALL USING (user_id = current_user_id());
CREATE POLICY "subjects: admin"       ON subjects FOR ALL USING (current_user_role() = 'admin');

-- TASKS
CREATE POLICY "tasks: own"            ON tasks FOR ALL USING (user_id = current_user_id());
CREATE POLICY "tasks: admin"          ON tasks FOR ALL USING (current_user_role() = 'admin');

-- TASK_COMMENTS
CREATE POLICY "comments: own task"    ON task_comments FOR ALL USING (
    task_id IN (SELECT task_id FROM tasks WHERE user_id = current_user_id())
    OR current_user_role() = 'admin'
);

-- ATTACHMENTS
CREATE POLICY "attachments: own"      ON attachments FOR ALL USING (user_id = current_user_id());
CREATE POLICY "attachments: admin"    ON attachments FOR ALL USING (current_user_role() = 'admin');

-- TAGS
CREATE POLICY "tags: own"             ON tags FOR ALL USING (user_id = current_user_id());

-- NOTIFICATIONS
CREATE POLICY "notif: own"            ON notifications FOR ALL USING (user_id = current_user_id());

-- AUDIT_LOGS
CREATE POLICY "audit: own read"       ON audit_logs FOR SELECT USING (user_id = current_user_id());
CREATE POLICY "audit: admin read"     ON audit_logs FOR SELECT USING (current_user_role() = 'admin');
CREATE POLICY "audit: insert"         ON audit_logs FOR INSERT WITH CHECK (true);

-- ============================================================
--  SEED DATA
-- ============================================================
INSERT INTO users (name, email, password_hash, role) VALUES
('System Admin', 'admin@stms.edu', 'managed_by_supabase_auth', 'admin'),
('Juan dela Cruz', 'juan@stms.edu', 'managed_by_supabase_auth', 'student');

INSERT INTO subjects (user_id, name, code, color_hex, instructor_name) VALUES
(2, 'Software Engineering', 'CSPC321', '#6366F1', 'Prof. Santos');

INSERT INTO tasks (user_id, subject_id, title, description, type, priority, status, due_date) VALUES
(2, 1, 'Pre-Final Project',
 'Student Task Management System documentation and deployment.',
 'project', 'high', 'ongoing', '2026-05-30');

-- ============================================================
--  After running this script:
--  1. Go to Supabase → Authentication → Users
--  2. Create users with the same emails above (admin@stms.edu, juan@stms.edu)
--  3. Their auth accounts will link to these rows via email match
--  4. To promote admin: UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
