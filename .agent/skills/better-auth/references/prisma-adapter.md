# Prisma Adapter & Schema Generation

## Concept
Better Auth needs specific tables (`User`, `Session`, `Account`, `Verification`, etc.).
Instead of manually typing these into `schema.prisma`, use the CLI.

## Workflow

1.  **Configure `auth.ts`**: Set up your plugins (e.g., Organization, Admin) first. The CLI reads this configuration.
2.  **Run Generator**:
    ```bash
    npx @better-auth/cli generate
    ```
    This command inspects your `auth.ts`, determines the needed schema, and updates your `prisma/schema.prisma` file automatically.
3.  **Migrate**:
    ```bash
    npx prisma migrate dev --name init_better_auth
    ```

## Manual Schema Reference (Fallback)
If automation fails, a basic schema looks like this:

```prisma
model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  userId    String
  token     String
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime
  updatedAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}
```
*Note: Plugins will add more fields and tables.*
