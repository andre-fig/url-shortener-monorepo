# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2024-08-12

### Added

- Introduced Kong as the API Gateway for handling route redirections.

## [0.3.0] - 2024-08-11

### Added

- Implemented JWT authentication for URL shortening service routes via KrakenD.
- Added endpoints to list, update, and delete shortened URLs.

## [0.2.0] - 2024-08-10

### Added

- Implemented URL shortening and redirection endpoints.
- Added JWT secret to UrlShortener module and updated Docker Compose configuration.

## [0.1.0] - 2024-08-10

### Added

- Implemented user registration and authentication with JWT.
- Created database schema modeling for users and shortened URLs, including migration setup.
- Initial project setup with monorepo, Docker, NestJS, TypeORM, and environment configuration.
