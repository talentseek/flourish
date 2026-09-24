# Better Auth Manual Prisma Schema

When the `@better-auth/cli` fails, use these manual models. 

## Core Models
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("USER")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("verifications")
}
```

## Organization Plugin Models
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String?  @unique
  logo      String?
  metadata  String?
  createdAt DateTime @default(now())
  members     Member[]
  invitations Invitation[]
  @@map("organizations")
}

model Member {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           String
  createdAt      DateTime     @default(now())
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("members")
}

model Invitation {
  id             String       @id @default(cuid())
  organizationId String
  email          String
  role           String?
  status         String
  expiresAt      DateTime
  inviterId      String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  inviter        User         @relation(fields: [inviterId], references: [id], onDelete: Cascade)
  @@map("invitations")
}
```
