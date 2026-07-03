-- ============================================================
-- KASSA — Plateforme Microfinance
-- Schéma PostgreSQL complet avec données de démonstration
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- MODULE UTILISATEURS & ORGANISATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS institutions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(150) NOT NULL,
    type        VARCHAR(50)  NOT NULL DEFAULT 'cooperative',
    code        VARCHAR(20)  UNIQUE NOT NULL,
    adresse     TEXT,
    telephone   VARCHAR(20),
    email       VARCHAR(100),
    logo_url    TEXT,
    statut      VARCHAR(20)  DEFAULT 'actif',
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id  UUID REFERENCES institutions(id),
    nom             VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  UNIQUE NOT NULL,
    ville           VARCHAR(80),
    region          VARCHAR(80),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agence_id           UUID REFERENCES agences(id),
    nom                 VARCHAR(80)  NOT NULL,
    prenom              VARCHAR(80)  NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    telephone           VARCHAR(20),
    password_hash       TEXT NOT NULL,
    role                VARCHAR(50)  NOT NULL,
    -- 'admin','directeur','responsable_agence','agent_credit','caissier','client'
    statut              VARCHAR(20)  DEFAULT 'actif',
    derniere_connexion  TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles_permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role        VARCHAR(50) NOT NULL,
    ressource   VARCHAR(80) NOT NULL,
    action      VARCHAR(30) NOT NULL,
    UNIQUE(role, ressource, action)
);

-- ============================================================
-- MODULE CLIENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id          UUID REFERENCES institutions(id),
    user_id                 UUID REFERENCES users(id),
    numero_membre           VARCHAR(30) UNIQUE NOT NULL,
    type_client             VARCHAR(30) DEFAULT 'particulier',
    nom                     VARCHAR(80) NOT NULL,
    prenom                  VARCHAR(80),
    date_naissance          DATE,
    sexe                    VARCHAR(10),
    nationalite             VARCHAR(50) DEFAULT 'Sénégalaise',
    type_piece              VARCHAR(30),
    numero_piece            VARCHAR(50),
    date_expiration_piece   DATE,
    telephone               VARCHAR(20),
    email                   VARCHAR(100),
    adresse                 TEXT,
    ville                   VARCHAR(80),
    situation_matrimoniale  VARCHAR(30),
    nombre_dependants       INTEGER DEFAULT 0,
    niveau_education        VARCHAR(50),
    activite_principale     VARCHAR(100),
    date_adhesion           DATE DEFAULT CURRENT_DATE,
    score_interne           DECIMAL(5,2) DEFAULT 0.00,
    statut                  VARCHAR(20) DEFAULT 'actif',
    created_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients_finances (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           UUID REFERENCES clients(id) UNIQUE,
    revenu_mensuel_net  DECIMAL(15,2),
    source_revenu       VARCHAR(100),
    charges_mensuelles  DECIMAL(15,2),
    epargne_actuelle    DECIMAL(15,2),
    autres_dettes       DECIMAL(15,2) DEFAULT 0,
    compte_epargne_no   VARCHAR(30),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garanties (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES clients(id),
    type_garantie   VARCHAR(50) NOT NULL,
    description     TEXT,
    valeur_estimee  DECIMAL(15,2),
    document_url    TEXT,
    statut          VARCHAR(20) DEFAULT 'disponible',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MODULE PRODUITS & DEMANDES
-- ============================================================

CREATE TABLE IF NOT EXISTS produits_credit (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID REFERENCES institutions(id),
    nom                 VARCHAR(100) NOT NULL,
    code                VARCHAR(20) UNIQUE NOT NULL,
    type                VARCHAR(50),
    montant_min         DECIMAL(15,2) NOT NULL,
    montant_max         DECIMAL(15,2) NOT NULL,
    duree_min_mois      INTEGER NOT NULL,
    duree_max_mois      INTEGER NOT NULL,
    taux_interet        DECIMAL(6,4) NOT NULL,
    type_taux           VARCHAR(20) DEFAULT 'fixe',
    periodicite         VARCHAR(20) DEFAULT 'mensuel',
    frais_dossier       DECIMAL(6,4) DEFAULT 0,
    assurance           DECIMAL(6,4) DEFAULT 0,
    penalite_retard     DECIMAL(6,4) DEFAULT 0.02,
    grace_period_jours  INTEGER DEFAULT 0,
    score_minimum       DECIMAL(5,2) DEFAULT 50.00,
    statut              VARCHAR(20) DEFAULT 'actif'
);

CREATE TABLE IF NOT EXISTS demandes_credit (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_demande              VARCHAR(30) UNIQUE NOT NULL,
    client_id                   UUID REFERENCES clients(id),
    produit_id                  UUID REFERENCES produits_credit(id),
    agence_id                   UUID REFERENCES agences(id),
    agent_id                    UUID REFERENCES users(id),
    montant_demande             DECIMAL(15,2) NOT NULL,
    duree_mois                  INTEGER NOT NULL,
    objet_credit                TEXT NOT NULL,
    description_projet          TEXT,
    garantie_id                 UUID REFERENCES garanties(id),
    type_garantie               VARCHAR(50),
    score_solvabilite           DECIMAL(5,2),
    niveau_risque               VARCHAR(20),
    statut                      VARCHAR(30) DEFAULT 'soumise',
    niveau_validation_actuel    INTEGER DEFAULT 1,
    date_soumission             TIMESTAMP DEFAULT NOW(),
    date_decision               TIMESTAMP,
    motif_rejet                 TEXT,
    created_at                  TIMESTAMP DEFAULT NOW(),
    updated_at                  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validations_credit (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id          UUID REFERENCES demandes_credit(id),
    niveau              INTEGER NOT NULL,
    validateur_id       UUID REFERENCES users(id),
    role_validateur     VARCHAR(50),
    decision            VARCHAR(20),
    commentaire         TEXT,
    montant_approuve    DECIMAL(15,2),
    date_reception      TIMESTAMP DEFAULT NOW(),
    date_decision       TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents_demande (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id      UUID REFERENCES demandes_credit(id),
    type_document   VARCHAR(50),
    nom_fichier     VARCHAR(200),
    url_stockage    TEXT NOT NULL,
    taille_ko       INTEGER,
    uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MODULE SCORING
-- ============================================================

CREATE TABLE IF NOT EXISTS rapports_scoring (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demande_id              UUID REFERENCES demandes_credit(id),
    client_id               UUID REFERENCES clients(id),
    score_historique        DECIMAL(5,2),
    score_capacite          DECIMAL(5,2),
    score_capital           DECIMAL(5,2),
    score_garantie          DECIMAL(5,2),
    score_anciennete        DECIMAL(5,2),
    score_activite          DECIMAL(5,2),
    poids_historique        DECIMAL(4,2) DEFAULT 30,
    poids_capacite          DECIMAL(4,2) DEFAULT 25,
    poids_capital           DECIMAL(4,2) DEFAULT 15,
    poids_garantie          DECIMAL(4,2) DEFAULT 15,
    poids_anciennete        DECIMAL(4,2) DEFAULT 10,
    poids_activite          DECIMAL(4,2) DEFAULT 5,
    score_final             DECIMAL(5,2) NOT NULL,
    niveau_risque           VARCHAR(20) NOT NULL,
    recommandation          VARCHAR(20) NOT NULL,
    ratio_endettement       DECIMAL(5,2),
    capacite_remboursement  DECIMAL(15,2),
    algorithme_version      VARCHAR(10) DEFAULT 'v1.0',
    generated_at            TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MODULE CRÉDITS & ÉCHÉANCIER
-- ============================================================

CREATE TABLE IF NOT EXISTS credits (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_credit           VARCHAR(30) UNIQUE NOT NULL,
    demande_id              UUID REFERENCES demandes_credit(id),
    client_id               UUID REFERENCES clients(id),
    produit_id              UUID REFERENCES produits_credit(id),
    agence_id               UUID REFERENCES agences(id),
    montant_accorde         DECIMAL(15,2) NOT NULL,
    taux_interet            DECIMAL(6,4) NOT NULL,
    duree_mois              INTEGER NOT NULL,
    periodicite             VARCHAR(20) NOT NULL,
    frais_dossier           DECIMAL(15,2) DEFAULT 0,
    frais_assurance         DECIMAL(15,2) DEFAULT 0,
    montant_total_du        DECIMAL(15,2) NOT NULL,
    date_deblocage          DATE NOT NULL,
    date_premiere_echeance  DATE NOT NULL,
    date_derniere_echeance  DATE NOT NULL,
    capital_restant_du      DECIMAL(15,2) NOT NULL,
    interets_payes          DECIMAL(15,2) DEFAULT 0,
    capital_paye            DECIMAL(15,2) DEFAULT 0,
    jours_retard            INTEGER DEFAULT 0,
    montant_retard          DECIMAL(15,2) DEFAULT 0,
    penalites_dues          DECIMAL(15,2) DEFAULT 0,
    statut                  VARCHAR(30) DEFAULT 'actif',
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS echeancier (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_id               UUID REFERENCES credits(id),
    numero_echeance         INTEGER NOT NULL,
    date_echeance           DATE NOT NULL,
    capital_prevu           DECIMAL(15,2) NOT NULL,
    interet_prevu           DECIMAL(15,2) NOT NULL,
    assurance_prevue        DECIMAL(15,2) DEFAULT 0,
    mensualite_prevue       DECIMAL(15,2) NOT NULL,
    capital_restant_avant   DECIMAL(15,2) NOT NULL,
    capital_restant_apres   DECIMAL(15,2) NOT NULL,
    montant_paye            DECIMAL(15,2) DEFAULT 0,
    date_paiement           DATE,
    statut                  VARCHAR(20) DEFAULT 'en_attente',
    jours_retard            INTEGER DEFAULT 0,
    penalite                DECIMAL(15,2) DEFAULT 0,
    UNIQUE(credit_id, numero_echeance)
);

-- ============================================================
-- MODULE REMBOURSEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS remboursements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_recu         VARCHAR(30) UNIQUE NOT NULL,
    credit_id           UUID REFERENCES credits(id),
    client_id           UUID REFERENCES clients(id),
    caissier_id         UUID REFERENCES users(id),
    montant_recu        DECIMAL(15,2) NOT NULL,
    mode_paiement       VARCHAR(30) NOT NULL,
    reference_paiement  VARCHAR(100),
    part_capital        DECIMAL(15,2) NOT NULL,
    part_interet        DECIMAL(15,2) NOT NULL,
    part_penalite       DECIMAL(15,2) DEFAULT 0,
    part_assurance      DECIMAL(15,2) DEFAULT 0,
    echeance_id         UUID REFERENCES echeancier(id),
    date_paiement       DATE NOT NULL DEFAULT CURRENT_DATE,
    notes               TEXT,
    statut              VARCHAR(20) DEFAULT 'valide',
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MODULE IMPAYÉS & ALERTES
-- ============================================================

CREATE TABLE IF NOT EXISTS impayes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_id           UUID REFERENCES credits(id),
    echeance_id         UUID REFERENCES echeancier(id),
    date_echeance       DATE NOT NULL,
    montant_impaye      DECIMAL(15,2) NOT NULL,
    jours_retard        INTEGER NOT NULL,
    classification      VARCHAR(30) NOT NULL,
    provision_requise   DECIMAL(15,2),
    statut              VARCHAR(20) DEFAULT 'ouvert',
    date_regularisation DATE,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_id       UUID REFERENCES credits(id),
    client_id       UUID REFERENCES clients(id),
    type_alerte     VARCHAR(50) NOT NULL,
    message         TEXT NOT NULL,
    canal           VARCHAR(20),
    statut_envoi    VARCHAR(20) DEFAULT 'en_attente',
    scheduled_at    TIMESTAMP NOT NULL,
    sent_at         TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MODULE REPORTING
-- ============================================================

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id      UUID REFERENCES institutions(id),
    agence_id           UUID REFERENCES agences(id),
    date_snapshot       DATE NOT NULL,
    nb_credits_actifs   INTEGER DEFAULT 0,
    encours_total       DECIMAL(15,2) DEFAULT 0,
    decaissements_mois  DECIMAL(15,2) DEFAULT 0,
    remboursements_mois DECIMAL(15,2) DEFAULT 0,
    par_30              DECIMAL(6,4) DEFAULT 0,
    par_60              DECIMAL(6,4) DEFAULT 0,
    par_90              DECIMAL(6,4) DEFAULT 0,
    taux_recouvrement   DECIMAL(6,4) DEFAULT 0,
    provisions_totales  DECIMAL(15,2) DEFAULT 0,
    demandes_recues     INTEGER DEFAULT 0,
    demandes_approuvees INTEGER DEFAULT 0,
    UNIQUE(institution_id, agence_id, date_snapshot)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID,
    entite              VARCHAR(50),
    entite_id           UUID,
    action              VARCHAR(50),
    anciennes_valeurs   JSONB,
    nouvelles_valeurs   JSONB,
    adresse_ip          VARCHAR(45),
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEX DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_clients_numero       ON clients(numero_membre);
CREATE INDEX IF NOT EXISTS idx_credits_client       ON credits(client_id);
CREATE INDEX IF NOT EXISTS idx_credits_statut       ON credits(statut);
CREATE INDEX IF NOT EXISTS idx_echeancier_date      ON echeancier(date_echeance, statut);
CREATE INDEX IF NOT EXISTS idx_remb_credit          ON remboursements(credit_id);
CREATE INDEX IF NOT EXISTS idx_alertes_scheduled    ON alertes(scheduled_at, statut_envoi);
CREATE INDEX IF NOT EXISTS idx_snapshot_date        ON portfolio_snapshots(date_snapshot DESC);
CREATE INDEX IF NOT EXISTS idx_impayes_class        ON impayes(classification, statut);
CREATE INDEX IF NOT EXISTS idx_demandes_statut      ON demandes_credit(statut);
CREATE INDEX IF NOT EXISTS idx_users_role           ON users(role);

-- ============================================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================================

INSERT INTO institutions (id, nom, type, code, adresse, telephone, email) VALUES
  ('11111111-0000-0000-0000-000000000001','Caisse Centrale Dakar','cooperative','CCD-001','Avenue Cheikh Anta Diop, Dakar','+221 33 821 0000','ccd@kassa.sn'),
  ('11111111-0000-0000-0000-000000000002','Coopérative Pikine','cooperative','CPK-002','Marché Tilène, Pikine','+221 33 834 1234','pikine@kassa.sn'),
  ('11111111-0000-0000-0000-000000000003','Mutuelle Thiès','imf','MTH-003','Rue Léon Mbaye, Thiès','+221 33 951 5678','thies@kassa.sn'),
  ('11111111-0000-0000-0000-000000000004','Caisse Ziguinchor','cooperative','CZG-004','Quartier Boucotte, Ziguinchor','+221 33 991 2345','ziguinchor@kassa.sn')
ON CONFLICT DO NOTHING;

INSERT INTO agences (id, institution_id, nom, code, ville, region) VALUES
  ('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','Agence Principale Dakar','AGC-DKR','Dakar','Dakar'),
  ('22222222-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000002','Agence Pikine','AGC-PKN','Pikine','Dakar'),
  ('22222222-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003','Agence Thiès','AGC-THS','Thiès','Thiès'),
  ('22222222-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000004','Agence Ziguinchor','AGC-ZGC','Ziguinchor','Ziguinchor')
ON CONFLICT DO NOTHING;

-- Mots de passe: password123 (bcrypt hash)
INSERT INTO users (id, agence_id, nom, prenom, email, telephone, password_hash, role) VALUES
  ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','Diagne','Aliou','admin@kassa.sn','+221 77 000 0001','$2b$10$example_hash_admin','admin'),
  ('33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000001','Niang','Moussa','directeur@kassa.sn','+221 77 000 0002','$2b$10$example_hash_dir','directeur'),
  ('33333333-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000001','Diallo','Aissatou','agent@kassa.sn','+221 77 000 0003','$2b$10$example_hash_agent','agent_credit'),
  ('33333333-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000001','Seck','Omar','caissier@kassa.sn','+221 77 000 0004','$2b$10$example_hash_caissier','caissier'),
  ('33333333-0000-0000-0000-000000000005','22222222-0000-0000-0000-000000000002','Fall','Ibrahima','resp.agence@kassa.sn','+221 77 000 0005','$2b$10$example_hash_resp','responsable_agence')
ON CONFLICT DO NOTHING;

INSERT INTO roles_permissions (role, ressource, action) VALUES
  ('admin','*','*'),
  ('directeur','dashboard','read'),('directeur','credits','read'),('directeur','credits','approve'),
  ('directeur','clients','read'),('directeur','remboursements','read'),('directeur','rapports','read'),
  ('agent_credit','demandes','create'),('agent_credit','demandes','read'),('agent_credit','clients','create'),
  ('agent_credit','clients','read'),('agent_credit','scoring','read'),
  ('caissier','remboursements','create'),('caissier','remboursements','read'),('caissier','echeancier','read'),
  ('responsable_agence','demandes','approve'),('responsable_agence','credits','read'),('responsable_agence','clients','read'),
  ('client','mes_credits','read'),('client','mes_remboursements','read'),('client','mon_profil','read')
ON CONFLICT DO NOTHING;

INSERT INTO produits_credit (institution_id, nom, code, type, montant_min, montant_max, duree_min_mois, duree_max_mois, taux_interet, frais_dossier, score_minimum) VALUES
  ('11111111-0000-0000-0000-000000000001','Crédit Fonds de Roulement','CFR-001','fonds_roulement',50000,5000000,3,24,0.0150,0.01,50),
  ('11111111-0000-0000-0000-000000000001','Crédit Équipement','CEQ-001','equipement',200000,15000000,6,48,0.0125,0.015,60),
  ('11111111-0000-0000-0000-000000000001','Crédit Habitat','CHA-001','habitat',500000,20000000,12,120,0.0100,0.02,65),
  ('11111111-0000-0000-0000-000000000001','Crédit Agricole','CAG-001','agricole',50000,3000000,3,18,0.0100,0.005,45)
ON CONFLICT DO NOTHING;
