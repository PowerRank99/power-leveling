
import { getClassRegistry } from './ClassRegistry';
import { RitmoDaNatureza, CochiladaMistica } from '../bonus/DruidaPassiveSkill';
import { FluxoArcano, PijamaArcano, TopoDaMontanha } from '../bonus/BruxoPassiveSkill';

/**
 * Register all classes with the class registry
 * This function should be called at app initialization
 */
export function registerClasses() {
  const registry = getClassRegistry();
  
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
  
  // TODO: Register other classes here
  // We'll implement Guerreiro, Monge, Ninja, and Paladino in the next phase
  
  console.log('Class registry initialized with Druida and enhanced Bruxo classes');
}
