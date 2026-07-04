-- ============================================================
--  KASSA Microfinance — Schéma complet (aligné frontend)
-- ============================================================
CREATE DATABASE IF NOT EXISTS kassa_microfinance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kassa_microfinance;

-- ─── Coopératives / institutions ────────────────────────────
CREATE TABLE IF NOT EXISTS cooperatives (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(150) NOT NULL,
  code        VARCHAR(30)  UNIQUE NOT NULL,
  adresse     VARCHAR(250),
  telephone   VARCHAR(25),
  email       VARCHAR(120),
  statut      ENUM('active','inactive') DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Utilisateurs (tous rôles) ──────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  nom                 VARCHAR(100) NOT NULL,
  prenom              VARCHAR(100) NOT NULL,
  email               VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe        VARCHAR(255) NOT NULL,
  role                ENUM('admin','directeur','responsable_agence','agent_credit','caissier','client') NOT NULL,
  agence              VARCHAR(150),
  institution         VARCHAR(150),
  cooperative_id      INT,
  actif               BOOLEAN DEFAULT TRUE,
  must_change_password BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id) ON DELETE SET NULL
);

-- ─── Membres (clients des coopératives) ─────────────────────
CREATE TABLE IF NOT EXISTS membres (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  cooperative_id   INT,
  nom              VARCHAR(100) NOT NULL,
  prenom           VARCHAR(100) NOT NULL,
  cin              VARCHAR(30)  UNIQUE,
  telephone        VARCHAR(25),
  email            VARCHAR(150),
  adresse          VARCHAR(250),
  date_naissance   DATE,
  profession       VARCHAR(120),
  revenu_mensuel   DECIMAL(15,2),
  statut           ENUM('actif','inactif','suspendu') DEFAULT 'actif',
  score_solvabilite INT DEFAULT 0,
  nb_credits       INT DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id) ON DELETE SET NULL
);

-- ─── Demandes de crédit ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS demandes_credit (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  client           VARCHAR(200) NOT NULL,
  membre_id        INT,
  produit          VARCHAR(150),
  montant          DECIMAL(15,2) NOT NULL,
  duree            INT NOT NULL,
  objet            TEXT,
  score            INT,
  statut           ENUM('soumise','en_validation_n2','en_validation_n3','approuvee','decaissee','rejetee') DEFAULT 'soumise',
  agent            VARCHAR(150),
  agent_id         INT,
  motif_rejet      TEXT,
  telephone        VARCHAR(25),
  date             DATE NOT NULL,
  date_decaissement DATE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membre_id)  REFERENCES membres(id) ON DELETE SET NULL,
  FOREIGN KEY (agent_id)   REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ─── Crédits actifs (= demandes décaissées) ─────────────────
CREATE TABLE IF NOT EXISTS credits (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  demande_id       INT UNIQUE NOT NULL,
  ref              VARCHAR(30) UNIQUE NOT NULL,
  client           VARCHAR(200) NOT NULL,
  membre_id        INT,
  produit          VARCHAR(150),
  montant          DECIMAL(15,2) NOT NULL,
  duree            INT NOT NULL,
  mensualite       DECIMAL(15,2) NOT NULL,
  date_debut       DATE NOT NULL,
  telephone        VARCHAR(25),
  statut           ENUM('actif','cloture','en_defaut') DEFAULT 'actif',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes_credit(id),
  FOREIGN KEY (membre_id)  REFERENCES membres(id) ON DELETE SET NULL
);

-- ─── Paiements d'échéances ───────────────────────────────────
CREATE TABLE IF NOT EXISTS paiements (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  credit_id       INT NOT NULL,
  credit_ref      VARCHAR(30) NOT NULL,
  echeance_num    INT NOT NULL,
  echeance_id     VARCHAR(50) NOT NULL,
  client          VARCHAR(200) NOT NULL,
  montant         DECIMAL(15,2) NOT NULL,
  mode            ENUM('especes','mobile_money','virement','cheque') DEFAULT 'especes',
  ref_transaction VARCHAR(100),
  date_paiement   DATE NOT NULL,
  heure           VARCHAR(10),
  caissier_id     INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credit_id)   REFERENCES credits(id),
  FOREIGN KEY (caissier_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- ============================================================
--  Données initiales
-- ============================================================

INSERT INTO cooperatives (nom, code, adresse, telephone) VALUES
('Caisse Centrale Dakar', 'CCD-001', 'Avenue Cheikh Anta Diop, Dakar', '+221 33 821 0000'),
('Coopérative Pikine',    'CPK-002', 'Marché Tilène, Pikine',           '+221 33 834 1234'),
('Mutuelle Thiès',        'MTH-003', 'Rue Léon Mbaye, Thiès',           '+221 33 951 5678');

-- Mot de passe : password123  (bcrypt hash)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, agence, institution, cooperative_id) VALUES
('Diagne',  'Aliou',    'admin@kassa.sn',       '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WqxQ7fY5yDdBCxbUBa3m', 'admin',              'Agence Principale Dakar', 'Caisse Centrale Dakar', 1),
('Niang',   'Moussa',   'directeur@kassa.sn',   '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WqxQ7fY5yDdBCxbUBa3m', 'directeur',          'Agence Principale Dakar', 'Caisse Centrale Dakar', 1),
('Diallo',  'Aissatou', 'agent@kassa.sn',       '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WqxQ7fY5yDdBCxbUBa3m', 'agent_credit',       'Agence Principale Dakar', 'Caisse Centrale Dakar', 1),
('Seck',    'Omar',     'caissier@kassa.sn',    '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WqxQ7fY5yDdBCxbUBa3m', 'caissier',           'Agence Principale Dakar', 'Caisse Centrale Dakar', 1),
('Fall',    'Ibrahima', 'resp.agence@kassa.sn', '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WqxQ7fY5yDdBCxbUBa3m', 'responsable_agence', 'Agence Pikine',           'Coopérative Pikine',    2),
('Diallo',  'Mamadou',  'client@kassa.sn',      '$2b$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WqxQ7fY5yDdBCxbUBa3m', 'client',             NULL,                      'Caisse Centrale Dakar', 1);

INSERT INTO membres (cooperative_id, nom, prenom, cin, telephone, profession, revenu_mensuel, score_solvabilite) VALUES
(1, 'Diallo',  'Mamadou',  '1199012345', '+221 77 123 4567', 'Commerçant',  350000, 82),
(1, 'Sow',     'Fatou',    '2198098765', '+221 77 234 5678', 'Artisane',    180000, 74),
(1, 'Ndiaye',  'Ibrahima', '1195076543', '+221 77 345 6789', 'Agriculteur', 220000, 68),
(2, 'Ba',      'Aminata',  '2200054321', '+221 77 456 7890', 'Couturière',  150000, 71),
(2, 'Kane',    'Oumar',    '1197043210', '+221 77 567 8901', 'Mécanicien',  280000, 79),
(3, 'Fall',    'Marième',  '2201032109', '+221 77 678 9012', 'Enseignante', 320000, 88),
(1, 'Mbaye',   'Cheikh',   '1196021098', '+221 77 789 0123', 'Pêcheur',     200000, 65),
(2, 'Diop',    'Rokhaya',  '2199010987', '+221 77 890 1234', 'Vendeuse',    160000, 72),
(1, 'Sarr',    'Modou',    '1200009876', '+221 77 901 2345', 'Chauffeur',   240000, 77),
(2, 'Cissé',   'Binta',    '2202098765', '+221 77 012 3456', 'Infirmière',  380000, 91),
(1, 'Ndiaye',  'Ibrahima', '1199087654', '+221 77 345 6789', 'Agriculteur', 220000, 68);

INSERT INTO demandes_credit (client, produit, montant, duree, objet, score, statut, agent, date) VALUES
('Mamadou Diallo', 'Crédit Équipement',  2500000, 24, 'Achat matériel',            82, 'en_validation_n2', 'Aissatou Diallo', '2026-07-01'),
('Aminata Ba',     'Fonds de Roulement', 600000,  12, 'Fonds de roulement',        71, 'soumise',          'Aissatou Diallo', '2026-07-02'),
('Oumar Kane',     'Crédit Équipement',  3000000, 36, 'Équipement industriel',     79, 'en_validation_n3', 'Aissatou Diallo', '2026-06-28'),
('Marième Fall',   'Fonds de Roulement', 1200000, 18, 'Commerce',                  88, 'approuvee',        'Aissatou Diallo', '2026-06-25'),
('Rokhaya Diop',   'Fonds de Roulement', 500000,  12, 'Activité commerciale',      72, 'soumise',          'Aissatou Diallo', '2026-07-03'),
('Binta Cissé',    'Crédit Habitat',     4000000, 48, 'Construction maison',       91, 'en_validation_n2', 'Ibrahima Fall',   '2026-07-02'),
('Lamine Ndiaye',  'Crédit Immobilier',  5000000, 60, 'Investissement immobilier', 84, 'en_validation_n3', 'Ibrahima Fall',   '2026-06-30'),
('Fatou Sow',      'Crédit Agricole',    350000,  12, 'Agriculture',               65, 'soumise',          'Ibrahima Fall',   '2026-07-02'),
('Amadou Diop',    'Crédit Équipement',  2000000, 24, 'Équipement professionnel',  75, 'soumise',          'Ibrahima Fall',   '2026-06-30');

-- Crédits décaissés (suivis par le caissier)
INSERT INTO demandes_credit (client, produit, montant, duree, objet, score, statut, agent, date, date_decaissement, telephone) VALUES
('Modou Sarr',      'Fonds de Roulement', 1020000, 12, 'Commerce général',     77, 'decaissee', 'Aissatou Diallo', '2025-07-03', '2025-07-04', '+221 77 901 2345'),
('Fatou Sow',       'Crédit Agricole',    852000,  12, 'Campagne agricole',    65, 'decaissee', 'Ibrahima Fall',   '2025-10-01', '2025-10-05', '+221 77 234 5678'),
('Cheikh Mbaye',    'Fonds de Roulement', 600000,  12, 'Stock marchandises',   68, 'decaissee', 'Aissatou Diallo', '2026-02-10', '2026-02-15', '+221 77 789 0123'),
('Ibrahima Ndiaye', 'Crédit Équipement',  1140000, 12, 'Matériel agricole',    68, 'decaissee', 'Ibrahima Fall',   '2025-12-01', '2025-12-05', '+221 77 345 6789'),
('Rokhaya Diop',    'Fonds de Roulement', 480000,  12, 'Activité commerciale', 72, 'decaissee', 'Aissatou Diallo', '2026-03-01', '2026-03-03', '+221 77 890 1234'),
('Binta Cissé',     'Crédit Habitat',     4656000, 48, 'Construction maison',  91, 'decaissee', 'Ibrahima Fall',   '2026-01-15', '2026-01-20', '+221 77 012 3456'),
('Oumar Kane',      'Crédit Équipement',  3216000, 36, 'Équipement atelier',   79, 'decaissee', 'Aissatou Diallo', '2026-04-01', '2026-04-05', '+221 77 567 8901');

-- Crédits (générés depuis demandes décaissées)
INSERT INTO credits (demande_id, ref, client, produit, montant, duree, mensualite, date_debut, telephone) VALUES
(10, 'CRD-2025-0010', 'Modou Sarr',      'Fonds de Roulement', 1020000, 12, 85000,  '2025-07-04', '+221 77 901 2345'),
(11, 'CRD-2025-0011', 'Fatou Sow',       'Crédit Agricole',    852000,  12, 71000,  '2025-10-05', '+221 77 234 5678'),
(12, 'CRD-2026-0012', 'Cheikh Mbaye',    'Fonds de Roulement', 600000,  12, 50000,  '2026-02-15', '+221 77 789 0123'),
(13, 'CRD-2025-0013', 'Ibrahima Ndiaye', 'Crédit Équipement',  1140000, 12, 95000,  '2025-12-05', '+221 77 345 6789'),
(14, 'CRD-2026-0014', 'Rokhaya Diop',    'Fonds de Roulement', 480000,  12, 40000,  '2026-03-03', '+221 77 890 1234'),
(15, 'CRD-2026-0015', 'Binta Cissé',     'Crédit Habitat',     4656000, 48, 97000,  '2026-01-20', '+221 77 012 3456'),
(16, 'CRD-2026-0016', 'Oumar Kane',      'Crédit Équipement',  3216000, 36, 89333,  '2026-04-05', '+221 77 567 8901');
