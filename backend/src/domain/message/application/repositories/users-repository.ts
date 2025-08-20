import { User } from "../../enterprise/entities/user";

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
  save(user: User): Promise<void>;
}