import { ServicesManager } from '../services-manager';

/**
 * inject service as getter
 * if serviceName is missed will try to use property name
 */
// 为类注入service的单例
export function Inject(serviceName?: string) {
  return function (target: Object, key: string) {
    Object.defineProperty(target, key, {
      get() {
        const name = serviceName || key.charAt(0).toUpperCase() + key.slice(1);
        const service = ServicesManager.instance.getService(name);
        if (!service) throw `Service not found: ${name}`;
        return service.instance;
      }
    });
  };
}
