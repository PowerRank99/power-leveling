
import { getClassRegistry } from './ClassRegistry';
import { RitmoDaNatureza, CochiladaMistica } from '../bonus/DruidaPassiveSkill';
import { FluxoArcano, PijamaArcano, TopoDaMontanha } from '../bonus/BruxoPassiveSkill';
import { ForcaBruta, SaindoDaJaula } from '../bonus/GuerreiroPassiveSkill';
import { ForcaInterior, DiscipuloDoAlgoritmo } from '../bonus/MongePassiveSkill';
import { ForrestGump, HIITAndRun } from '../bonus/NinjaPassiveSkill';
import { CaminhoDoHeroi, Camisa10 } from '../bonus/PaladinoPassiveSkill';

/**
 * Register all classes with the class registry
 * This function should be called at app initialization
 */
export function registerClasses() {
  const registry = getClassRegistry();
  
  // Register Guerreiro class
  registry.registerClass({
    className: 'Guerreiro',
    primaryAbility: new ForcaBruta(),
    secondaryAbility: new SaindoDaJaula(),
    color: 'from-red-600 to-red-800',
    icon: 'Sword',
    description: 'Especialista em Força'
  });
  
  // Register Monge class
  registry.registerClass({
    className: 'Monge',
    primaryAbility: new ForcaInterior(),
    secondaryAbility: new DiscipuloDoAlgoritmo(),
    color: 'from-amber-600 to-amber-800',
    icon: 'Fist',
    description: 'Especialista em Calistenia'
  });
  
  // Register Ninja class
  registry.registerClass({
    className: 'Ninja',
    primaryAbility: new ForrestGump(),
    secondaryAbility: new HIITAndRun(),
    color: 'from-emerald-600 to-emerald-800',
    icon: 'Wind',
    description: 'Especialista em Cardio'
  });
  
  // Register Paladino class
  registry.registerClass({
    className: 'Paladino',
    primaryAbility: new CaminhoDoHeroi(),
    secondaryAbility: new Camisa10(),
    color: 'from-blue-600 to-blue-800',
    icon: 'Shield',
    description: 'Especialista em Esportes'
  });
  
  // Register Druida class
  registry.registerClass({
    className: 'Druida',
    primaryAbility: new RitmoDaNatureza(),
    secondaryAbility: new CochiladaMistica(),
    color: 'from-green-600 to-green-800',
    icon: 'LeafyGreen',
    description: 'Especialista em Flexibilidade'
  });
  
  // Register enhanced Bruxo class
  registry.registerClass({
    className: 'Bruxo',
    primaryAbility: new FluxoArcano(),
    secondaryAbility: new PijamaArcano(), // Using PijamaArcano as the main secondary ability
    color: 'from-purple-600 to-purple-800',
    icon: 'Sparkles',
    description: 'Especialista em Magia Arcana'
  });
  
  console.log('Class registry initialized with all classes');
}
