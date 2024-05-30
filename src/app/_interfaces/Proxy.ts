import {Entity} from "../_models/entities/entity";

export interface Proxy<T extends Entity> {
  toDTO(): T;
}
