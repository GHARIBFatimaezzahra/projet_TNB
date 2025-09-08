# 📊 Dashboard Fiscal Interactif - GeoTNB

## 🎯 Vue d'ensemble

Le Dashboard Fiscal Interactif est un tableau de bord en temps réel conçu pour la gestion et l'analyse des données de la Taxe sur les Terrains Non Bâtis (TNB). Il offre une visualisation complète des indicateurs clés, des statistiques géospatiales et des analyses fiscales.

## ✨ Fonctionnalités principales

### 📈 Indicateurs en temps réel
- **Terrains recensés** : Nombre total de parcelles enregistrées
- **Terrains imposables** : Parcelles soumises à la TNB
- **Superficie totale** : Surface totale recensée en hectares
- **Surface imposable** : Surface taxable en hectares
- **Rendement prévisionnel** : Recettes annuelles prévues en MDH
- **Taux d'assujettissement** : Pourcentage de parcelles imposables

### 📊 Graphiques interactifs
- **Camembert Statut Foncier** : Répartition par statut (TF, R, NI, Domanial, Collectif)
- **Graphique linéaire** : Évolution mensuelle des recettes
- **Histogramme Zonage** : Distribution par zone urbanistique (R1, R2, R3, I, C)
- **Camembert Tarifs** : Répartition par tranches tarifaires

### 🗺️ Cartes thématiques
- **Carte interactive** avec OpenLayers
- **Thèmes multiples** : densité, tarifs, statut, occupation, zonage
- **Couches superposables** : parcelles, limites, plans, orthophotos
- **Légende dynamique** adaptée au thème sélectionné

### 📤 Exports et rapports
- **Export PDF** : Rapports complets, cartes, fiches par secteur
- **Export Excel** : Données tabulaires et graphiques
- **Export par graphique** : Chaque visualisation exportable individuellement

## 🏗️ Architecture technique

### Structure des fichiers
```
dashboard/
├── components/
│   └── dashboard.component.ts/html/scss
├── services/
│   ├── dashboard.service.ts
│   └── dashboard-data.service.ts
├── models/
│   └── dashboard.models.ts
├── constants/
│   └── dashboard-colors.ts
├── scripts/
│   └── load-chartjs.ts
└── README.md
```

### Technologies utilisées
- **Angular 17** : Framework principal
- **Chart.js 3.9.1** : Graphiques interactifs
- **Angular Material** : Composants UI
- **RxJS** : Gestion des flux de données temps réel
- **TypeScript** : Typage strict
- **SCSS** : Styling moderne et responsive

## 🔄 Mise à jour temps réel

### Fréquence des mises à jour
- **Automatique** : Toutes les 5 minutes
- **Manuelle** : Bouton de rafraîchissement
- **Indicateur visuel** : Synchronisation en temps réel

### Sources de données
- **API Backend** : Données réelles via `DashboardDataService`
- **Fallback** : Données de démonstration en cas d'erreur
- **Cache local** : Optimisation des performances

## 🎨 Design et UX

### Palette de couleurs
```scss
// KPIs
terrainsRecenses: #3498db      // Bleu
terrainsImposables: #9b59b6    // Violet
superficieTotale: #2ecc71      // Vert
surfaceImposable: #e67e22      // Orange
rendementPrevisionnel: #27ae60 // Vert foncé
tauxAssujettissement: #f39c12  // Orange clair

// Statut Foncier
titreFoncier: #3498db          // Bleu - TF
requisition: #9b59b6           // Violet - R
nonImmatricule: #e74c3c        // Rouge - NI
domanial: #8e44ad              // Violet foncé
collectif: #f39c12             // Orange
```

### Responsive Design
- **Desktop** : Layout en grille optimisé
- **Tablet** : Adaptation des colonnes
- **Mobile** : Stack vertical avec navigation simplifiée

## 🚀 Utilisation

### Initialisation
```typescript
// Le dashboard se charge automatiquement au démarrage
ngOnInit(): void {
  this.initializeDashboard();
  this.startRealTimeUpdates();
}
```

### Filtrage des données
```typescript
// Les filtres sont réactifs et mettent à jour les données
selectedSecteur = 'all';
selectedZonage = 'all';
selectedStatutFoncier = 'all';
selectedOccupation = 'all';
```

### Export de données
```typescript
// Export PDF
exportToPDF(type: string): void {
  // Logique d'export PDF
}

// Export Excel
exportToExcel(type: string): void {
  // Logique d'export Excel
}
```

## 🔧 Configuration

### Variables d'environnement
```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api',
  refreshInterval: 300000, // 5 minutes
  chartAnimation: true
};
```

### Personnalisation des couleurs
```typescript
// dashboard-colors.ts
export const DASHBOARD_COLORS = {
  // Personnaliser les couleurs selon les besoins
};
```

## 📱 Responsive Breakpoints

```scss
// Mobile
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}

// Tablet
@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
  .map-section { grid-template-columns: 1fr; }
}

// Desktop
@media (min-width: 769px) {
  .stats-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
}
```

## 🐛 Dépannage

### Problèmes courants

1. **Graphiques ne s'affichent pas**
   - Vérifier que Chart.js est chargé
   - Contrôler les données dans `kpiData`

2. **Mise à jour temps réel ne fonctionne pas**
   - Vérifier la connexion API
   - Contrôler les logs de console

3. **Erreurs TypeScript**
   - Vérifier les types dans `dashboard.models.ts`
   - Contrôler les imports

### Logs de débogage
```typescript
// Activer les logs détaillés
console.log('Dashboard data:', this.kpiData);
console.log('Real-time status:', this.isRealTimeActive);
```

## 🔮 Évolutions futures

- [ ] Intégration OpenLayers complète
- [ ] Notifications push temps réel
- [ ] Comparaisons historiques
- [ ] Prédictions IA
- [ ] Export en temps réel
- [ ] Mode hors-ligne

## 📞 Support

Pour toute question ou problème :
- Consulter les logs de la console
- Vérifier la documentation des services
- Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Auteur** : Équipe GeoTNB

