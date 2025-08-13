// features/help/help.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-help-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="help">
      <div class="help-header">
        <h2>❓ Aide et Documentation</h2>
        <p>Guide d'utilisation du système GeoTNB</p>
      </div>
      
      <div class="help-content">
        <div class="help-sidebar">
          <div class="help-menu">
            <h3>📚 Sommaire</h3>
            <ul class="help-nav">
              <li><a href="#getting-started" class="help-link active">🚀 Prise en main</a></li>
              <li><a href="#parcelles" class="help-link">🗺️ Gestion des parcelles</a></li>
              <li><a href="#proprietaires" class="help-link">👥 Gestion des propriétaires</a></li>
              <li><a href="#calcul-tnb" class="help-link">💰 Calcul TNB</a></li>
              <li><a href="#rapports" class="help-link">📄 Rapports</a></li>
              <li><a href="#faq" class="help-link">❔ FAQ</a></li>
            </ul>
          </div>
          
          <div class="help-contact">
            <h3>📞 Support</h3>
            <div class="contact-info">
              <p><strong>Email:</strong> support@geotnb-oujda.ma</p>
              <p><strong>Téléphone:</strong> 0536 12 34 56</p>
              <p><strong>Horaires:</strong> 8h-17h (Lun-Ven)</p>
            </div>
          </div>
        </div>
        
        <div class="help-main">
          <section id="getting-started" class="help-section">
            <h3>🚀 Prise en main rapide</h3>
            
            <div class="getting-started-grid">
              <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Connexion</h4>
                  <p>Connectez-vous avec vos identifiants fournis par l'administrateur.</p>
                  <ul>
                    <li>Nom d'utilisateur</li>
                    <li>Mot de passe</li>
                    <li>Sélection du rôle si nécessaire</li>
                  </ul>
                </div>
              </div>
              
              <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Tableau de bord</h4>
                  <p>Consultez les statistiques et l'état général du système TNB.</p>
                  <ul>
                    <li>Nombre de parcelles</li>
                    <li>Montants TNB</li>
                    <li>Activités récentes</li>
                  </ul>
                </div>
              </div>
              
              <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Navigation</h4>
                  <p>Utilisez le menu latéral pour accéder aux différents modules.</p>
                  <ul>
                    <li>Parcelles</li>
                    <li>Propriétaires</li>
                    <li>Calculs TNB</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          <section id="calcul-tnb" class="help-section">
            <h3>💰 Calcul de la TNB</h3>
            
            <div class="info-box">
              <h4>📋 Réglementation</h4>
              <p>Le calcul de la TNB est régi par la <strong>Loi 47-06</strong> relative à la fiscalité des collectivités locales.</p>
            </div>
            
            <div class="calculation-info">
              <h4>🧮 Formule de calcul</h4>
              <div class="formula">
                <code>Montant TNB = Surface imposable × Tarif zone × Quote-part</code>
              </div>
              
              <h4>⏰ Exonérations automatiques</h4>
              <ul>
                <li><strong>3 ans</strong> : Parcelles ≤ 500 m²</li>
                <li><strong>5 ans</strong> : Parcelles de 500 à 1000 m²</li>
                <li><strong>7 ans</strong> : Parcelles > 1000 m²</li>
              </ul>
            </div>
          </section>
          
          <section id="faq" class="help-section">
            <h3>❔ Questions Fréquentes</h3>
            
            <div class="faq-list">
              <div class="faq-item">
                <h4 class="faq-question">Comment modifier une parcelle validée ?</h4>
                <div class="faq-answer">
                  <p>Seuls les administrateurs peuvent modifier une parcelle validée. Contactez votre administrateur système.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <h4 class="faq-question">Que faire en cas d'erreur de calcul TNB ?</h4>
                <div class="faq-answer">
                  <p>Vérifiez d'abord les données de base (surface, zone, tarif). Si l'erreur persiste, utilisez le calculateur manuel.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <h4 class="faq-question">Comment importer des données SIG ?</h4>
                <div class="faq-answer">
                  <p>Utilisez le module d'import avec des fichiers GeoJSON ou Shapefile. Assurez-vous que les données respectent la structure requise.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .help { padding: 1rem; max-width: 1400px; margin: 0 auto; }
    
    .help-header { text-align: center; margin-bottom: 2rem; }
    .help-header h2 { margin: 0 0 0.5rem 0; color: #333; font-size: 2rem; font-weight: 600; }
    .help-header p { margin: 0; color: #666; font-size: 1.1rem; }
    
    .help-content { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; }
    
    .help-sidebar { position: sticky; top: 1rem; height: fit-content; }
    
    .help-menu, .help-contact { 
      background: white; 
      padding: 1.5rem; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 1rem; 
    }
    
    .help-menu h3, .help-contact h3 { 
      margin: 0 0 1rem 0; 
      color: #333; 
      font-size: 1.1rem; 
      font-weight: 600; 
    }
    
    .help-nav { list-style: none; padding: 0; margin: 0; }
    .help-nav li { margin-bottom: 0.5rem; }
    
    .help-link { 
      display: block; 
      padding: 0.75rem 1rem; 
      color: #666; 
      text-decoration: none; 
      border-radius: 8px; 
      transition: all 0.2s ease; 
    }
    
    .help-link:hover, .help-link.active { 
      background: #e7f3ff; 
      color: #007bff; 
    }
    
    .contact-info p { margin: 0.5rem 0; font-size: 0.9rem; color: #666; }
    
    .help-main { 
      background: white; 
      padding: 2rem; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
    }
    
    .help-section { margin-bottom: 3rem; }
    .help-section h3 { 
      margin: 0 0 1.5rem 0; 
      color: #333; 
      font-size: 1.5rem; 
      font-weight: 600; 
      border-bottom: 2px solid #007bff; 
      padding-bottom: 0.5rem; 
    }
    
    .getting-started-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 1.5rem; 
    }
    
    .step-card { 
      background: #f8f9fa; 
      padding: 1.5rem; 
      border-radius: 12px; 
      border-left: 4px solid #007bff; 
      position: relative; 
    }
    
    .step-number { 
      position: absolute; 
      top: -10px; 
      left: 1rem; 
      background: #007bff; 
      color: white; 
      width: 30px; 
      height: 30px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: bold; 
    }
    
    .step-content h4 { margin: 0.5rem 0 1rem 0; color: #333; font-size: 1.1rem; }
    .step-content p { margin: 0 0 1rem 0; color: #666; line-height: 1.5; }
    .step-content ul { margin: 0; padding-left: 1.5rem; color: #666; }
    .step-content li { margin-bottom: 0.25rem; }
    
    .info-box { 
      background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
      padding: 1.5rem; 
      border-radius: 12px; 
      border-left: 4px solid #2196f3; 
      margin: 1.5rem 0; 
    }
    
    .info-box h4 { margin: 0 0 1rem 0; color: #1565c0; font-size: 1.1rem; }
    .info-box p { margin: 0; color: #0d47a1; line-height: 1.5; }
    
    .calculation-info h4 { margin: 1.5rem 0 1rem 0; color: #333; font-size: 1.1rem; }
    
    .formula { 
      background: #f8f9fa; 
      padding: 1rem; 
      border-radius: 8px; 
      border: 1px solid #e9ecef; 
      margin: 1rem 0; 
      text-align: center; 
    }
    
    .formula code { font-size: 1.1rem; color: #e83e8c; font-weight: 600; }
    
    .calculation-info ul { 
      background: #fff3cd; 
      padding: 1rem 1rem 0.5rem 2rem; 
      border-radius: 8px; 
      border-left: 4px solid #ffc107; 
      margin: 1rem 0; 
    }
    
    .calculation-info li { margin-bottom: 0.5rem; color: #856404; }
    
    .faq-list { margin-top: 1.5rem; }
    
    .faq-item { 
      background: #f8f9fa; 
      border-radius: 12px; 
      margin-bottom: 1rem; 
      overflow: hidden; 
      border: 1px solid #e9ecef; 
    }
    
    .faq-question { 
      margin: 0; 
      padding: 1rem 1.5rem; 
      background: #e9ecef; 
      color: #333; 
      font-size: 1rem; 
      font-weight: 600; 
    }
    
    .faq-answer { padding: 1rem 1.5rem; }
    .faq-answer p { margin: 0; color: #666; line-height: 1.5; }
    
    @media (max-width: 1024px) {
      .help-content { grid-template-columns: 1fr; }
      .help-sidebar { position: static; }
      .getting-started-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HelpHomeComponent { }

const routes = [
  { path: '', component: HelpHomeComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HelpHomeComponent  // ✅ CORRECTION: Import du composant standalone
  ],
  declarations: []  // ✅ CORRECTION: Vide car le composant est standalone
})
export class HelpModule { }