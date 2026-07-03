CREATE DATABASE IF NOT EXISTS kassa_microfinance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kassa_microfinance;

CREATE TABLE IF NOT EXISTS cooperatives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  adresse VARCHAR(200),
  telephone VARCHAR(20),
  email VARCHAR(100),
  date_creation DATE,
  statut ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cooperative_id INT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  cin VARCHAR(20) UNIQUE,
  telephone VARCHAR(20),
  email VARCHAR(100),
  adresse VARCHAR(200),
  date_naissance DATE,
  profession VARCHAR(100),
  revenu_mensuel DECIMAL(15,2),
  statut ENUM('actif','inactif','suspendu') DEFAULT 'actif',
  score_solvabilite INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id)
);

CREATE TABLE IF NOT EXISTS demandes_credit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membre_id INT NOT NULL,
  montant DECIMAL(15,2) NOT NULL,
  duree_mois INT NOT NULL,
  taux_interet DECIMAL(5,2) NOT NULL,
  objet VARCHAR(200),
  statut ENUM('en_attente','en_analyse','approuve','rejete','decaisse') DEFAULT 'en_attente',
  score_analyse INT,
  niveau_validation INT DEFAULT 1,
  agent_id INT,
  superviseur_id INT,
  directeur_id INT,
  date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_decision TIMESTAMP,
  motif_rejet TEXT,
  FOREIGN KEY (membre_id) REFERENCES membres(id)
);

CREATE TABLE IF NOT EXISTS credits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  demande_id INT NOT NULL,
  membre_id INT NOT NULL,
  montant_octroye DECIMAL(15,2) NOT NULL,
  taux_interet DECIMAL(5,2) NOT NULL,
  duree_mois INT NOT NULL,
  mensualite DECIMAL(15,2) NOT NULL,
  montant_rembourse DECIMAL(15,2) DEFAULT 0,
  solde_restant DECIMAL(15,2),
  date_decaissement DATE NOT NULL,
  date_echeance DATE NOT NULL,
  statut ENUM('actif','cloture','en_defaut','restructure') DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (demande_id) REFERENCES demandes_credit(id),
  FOREIGN KEY (membre_id) REFERENCES membres(id)
);

CREATE TABLE IF NOT EXISTS echeanciers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  credit_id INT NOT NULL,
  numero_echeance INT NOT NULL,
  date_echeance DATE NOT NULL,
  montant_principal DECIMAL(15,2) NOT NULL,
  montant_interet DECIMAL(15,2) NOT NULL,
  montant_total DECIMAL(15,2) NOT NULL,
  montant_paye DECIMAL(15,2) DEFAULT 0,
  statut ENUM('a_venir','paye','partiellement_paye','en_retard','impaye') DEFAULT 'a_venir',
  date_paiement DATE,
  FOREIGN KEY (credit_id) REFERENCES credits(id)
);

CREATE TABLE IF NOT EXISTS remboursements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  credit_id INT NOT NULL,
  echeance_id INT,
  montant DECIMAL(15,2) NOT NULL,
  date_paiement DATE NOT NULL,
  mode_paiement ENUM('especes','mobile_money','virement','cheque') DEFAULT 'especes',
  reference VARCHAR(50),
  caissier VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credit_id) REFERENCES credits(id),
  FOREIGN KEY (echeance_id) REFERENCES echeanciers(id)
);

CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('agent','superviseur','directeur','admin') DEFAULT 'agent',
  cooperative_id INT,
  statut ENUM('actif','inactif') DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id)
);

-- Données de démonstration
INSERT INTO cooperatives (nom, code, adresse, telephone, date_creation) VALUES
('Caisse Centrale Dakar', 'CCD-001', 'Avenue Cheikh Anta Diop, Dakar', '+221 33 821 0000', '2015-01-15'),
('Coopérative Pikine', 'CPK-002', 'Marché Tilène, Pikine', '+221 33 834 1234', '2017-03-20'),
('Mutuelle Thiès', 'MTH-003', 'Rue Léon Mbaye, Thiès', '+221 33 951 5678', '2018-06-10'),
('Caisse Ziguinchor', 'CZG-004', 'Quartier Boucotte, Ziguinchor', '+221 33 991 2345', '2019-09-05');

INSERT INTO membres (cooperative_id, nom, prenom, cin, telephone, profession, revenu_mensuel, score_solvabilite) VALUES
(1, 'Diallo', 'Mamadou', '1199012345', '+221 77 123 4567', 'Commerçant', 350000, 82),
(1, 'Sow', 'Fatou', '2198098765', '+221 77 234 5678', 'Artisane', 180000, 74),
(1, 'Ndiaye', 'Ibrahima', '1195076543', '+221 77 345 6789', 'Agriculteur', 220000, 68),
(2, 'Ba', 'Aminata', '2200054321', '+221 77 456 7890', 'Couturière', 150000, 71),
(2, 'Kane', 'Oumar', '1197043210', '+221 77 567 8901', 'Mécanicien', 280000, 79),
(3, 'Fall', 'Marième', '2201032109', '+221 77 678 9012', 'Enseignante', 320000, 88),
(3, 'Mbaye', 'Cheikh', '1196021098', '+221 77 789 0123', 'Pêcheur', 200000, 65),
(4, 'Diop', 'Rokhaya', '2199010987', '+221 77 890 1234', 'Vendeuse', 160000, 72),
(1, 'Sarr', 'Modou', '1200009876', '+221 77 901 2345', 'Chauffeur', 240000, 77),
(2, 'Cissé', 'Binta', '2202098765', '+221 77 012 3456', 'Infirmière', 380000, 91);

INSERT INTO demandes_credit (membre_id, montant, duree_mois, taux_interet, objet, statut, score_analyse) VALUES
(1, 2500000, 24, 12.5, 'Extension boutique', 'approuve', 82),
(2, 800000, 12, 14.0, 'Matériel couture', 'decaisse', 74),
(3, 1500000, 18, 13.0, 'Intrants agricoles', 'en_analyse', 68),
(4, 600000, 12, 14.5, 'Stock marchandises', 'en_attente', 71),
(5, 3000000, 36, 11.5, 'Atelier mécanique', 'approuve', 79),
(6, 1200000, 12, 12.0, 'Formation professionnelle', 'decaisse', 88),
(7, 900000, 18, 13.5, 'Équipement pêche', 'rejete', 65),
(8, 500000, 6, 15.0, 'Fonds de roulement', 'en_attente', 72),
(9, 1800000, 24, 12.5, 'Véhicule', 'en_analyse', 77),
(10, 4000000, 48, 11.0, 'Clinique privée', 'approuve', 91);
