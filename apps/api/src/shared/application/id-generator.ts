/**
 * Generates entity identifiers. IDs are created by the application, not the database,
 * so aggregates have identity before persistence and Mongo ObjectIds never leak into the API.
 */
export abstract class IdGenerator {
  abstract generate(): string;
}
