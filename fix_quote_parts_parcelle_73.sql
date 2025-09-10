-- =====================================================
-- SCRIPT DE CORRECTION DES QUOTE-PARTS - PARCELLE 73
-- =====================================================

-- 1. DIAGNOSTIC : Vérifier l'état actuel de la parcelle 73
SELECT 
    p.id,
    p.reference_fonciere,
    p.surface_totale,
    p.statut_foncier,
    COUNT(pp.id) as nombre_proprietaires,
    COALESCE(SUM(pp.quote_part), 0) as somme_quote_parts
FROM parcelles p
LEFT JOIN parcelle_proprietaires pp ON p.id = pp.parcelle_id 
    AND pp.est_actif = true 
    AND pp.date_fin IS NULL
WHERE p.id = 73
GROUP BY p.id, p.reference_fonciere, p.surface_totale, p.statut_foncier;

-- 2. DIAGNOSTIC : Voir tous les propriétaires de la parcelle 73
SELECT 
    pp.id,
    pp.parcelle_id,
    pp.proprietaire_id,
    pp.quote_part,
    pp.est_actif,
    pp.date_debut,
    pp.date_fin,
    pr.nom,
    pr.prenom,
    pr.cin_rc
FROM parcelle_proprietaires pp
LEFT JOIN proprietaires pr ON pp.proprietaire_id = pr.id
WHERE pp.parcelle_id = 73
ORDER BY pp.id;

-- 3. CORRECTION : Si aucun propriétaire actif, créer un propriétaire par défaut
-- D'abord, vérifier s'il existe des propriétaires inactifs
SELECT 
    COUNT(*) as proprietaires_inactifs,
    SUM(quote_part) as somme_quote_parts_inactifs
FROM parcelle_proprietaires 
WHERE parcelle_id = 73 
    AND (est_actif = false OR date_fin IS NOT NULL);

-- 4. SOLUTION 1 : Réactiver un propriétaire existant si possible
-- (Décommentez si vous voulez utiliser cette approche)
/*
UPDATE parcelle_proprietaires 
SET 
    est_actif = true,
    date_fin = NULL,
    quote_part = 1.0
WHERE parcelle_id = 73 
    AND id = (
        SELECT MIN(id) 
        FROM parcelle_proprietaires 
        WHERE parcelle_id = 73
    );
*/

-- 5. SOLUTION 2 : Créer un propriétaire par défaut si aucun n'existe
-- (Décommentez si vous voulez utiliser cette approche)
/*
-- Créer un propriétaire par défaut
INSERT INTO proprietaires (
    nom, 
    prenom, 
    cin_rc, 
    type_identifiant, 
    telephone, 
    email, 
    adresse,
    date_creation
) VALUES (
    'PROPRIETAIRE_DEFAUT', 
    'Parcelle 73', 
    'DEFAULT-73', 
    'CIN', 
    '0000000000', 
    'default@parcelle73.com', 
    'Adresse par défaut',
    NOW()
) ON CONFLICT (cin_rc) DO NOTHING;

-- Associer ce propriétaire à la parcelle 73
INSERT INTO parcelle_proprietaires (
    parcelle_id,
    proprietaire_id,
    quote_part,
    est_actif,
    date_debut,
    date_creation
) VALUES (
    73,
    (SELECT id FROM proprietaires WHERE cin_rc = 'DEFAULT-73'),
    1.0,
    true,
    NOW(),
    NOW()
);
*/

-- 6. SOLUTION 3 : Supprimer la parcelle 73 si elle n'est pas valide
-- (ATTENTION : Cette solution supprime définitivement la parcelle)
/*
-- Vérifier d'abord si la parcelle a des données importantes
SELECT 
    p.*,
    COUNT(dj.id) as nombre_documents,
    COUNT(ja.id) as nombre_actions_journal
FROM parcelles p
LEFT JOIN document_joints dj ON p.id = dj.parcelle_id
LEFT JOIN journal_actions ja ON p.id = ja.parcelle_id
WHERE p.id = 73
GROUP BY p.id;

-- Si vous voulez supprimer la parcelle 73 :
-- DELETE FROM parcelles WHERE id = 73;
*/

-- 7. VÉRIFICATION FINALE : Vérifier que la correction a fonctionné
SELECT 
    p.id,
    p.reference_fonciere,
    COUNT(pp.id) as nombre_proprietaires_actifs,
    COALESCE(SUM(pp.quote_part), 0) as somme_quote_parts,
    CASE 
        WHEN COALESCE(SUM(pp.quote_part), 0) = 1.0 THEN 'OK'
        ELSE 'ERREUR'
    END as statut_validation
FROM parcelles p
LEFT JOIN parcelle_proprietaires pp ON p.id = pp.parcelle_id 
    AND pp.est_actif = true 
    AND pp.date_fin IS NULL
WHERE p.id = 73
GROUP BY p.id, p.reference_fonciere;
