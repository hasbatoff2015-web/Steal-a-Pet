import type { PetId } from './pets';

export interface ShortcutDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly requiredPetIds: readonly PetId[];
}

export const SHORTCUT_DEFINITIONS = [
  { id: 'park-service-path', displayName: 'PARK SERVICE PATH', requiredPetIds: ['cat'] },
  { id: 'central-alley', displayName: 'CENTRAL ALLEY', requiredPetIds: ['fox'] },
  { id: 'rich-service-gate', displayName: 'RICH SERVICE GATE', requiredPetIds: ['peacock', 'panda'] },
  { id: 'vip-service-exit', displayName: 'VIP SERVICE EXIT', requiredPetIds: ['vip-a', 'vip-b'] },
] as const satisfies readonly ShortcutDefinition[];
