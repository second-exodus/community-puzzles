---
name: refactor
description: Surgical refactoring that improves the structure and readability of existing code without changing its behaviour, in small tested steps, with a catalogue of code smells and their fixes. Triggered by "refactor this", "fix these code smells", "this function is too long", "remove duplication", "break up this class".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review/style
---

# Refactor

## Goal

Improve code structure and readability without changing external behaviour. Refactoring is gradual evolution, not
revolution: use it to improve existing code, not to rewrite it from scratch.

## Steps

1. **Name the purpose.** Say what is hard about the code today (hard to read, hard to change, duplicated, too
   large) and what the refactoring should make easier. No purpose, no refactoring; check "When not to refactor".
2. **Prepare.** Make sure tests cover the behaviour you are about to touch. If they are missing, write
   characterisation tests first that pin down what the code does today, including edge cases and errors. Start
   from a clean, committed state, on a branch if the project works that way.
3. **Identify.** Find the code smell (see "Common code smells and fixes"), understand what the code does and who
   calls it, and plan a sequence of small, named operations (see "Common refactoring operations").
4. **Refactor in small steps.** Make one small change, run the tests, commit when they pass, repeat. If a test
   fails, undo the last step instead of debugging forward. Do not mix in feature changes or bug fixes; if you find
   a bug, note it and fix it in a separate change.
5. **Verify.** All tests pass without changing their expectations. Check manually where tests do not reach.
   Performance is unchanged or better. Go through the "Refactoring checklist".
6. **Clean up and report.** Update comments and documentation that mention the old structure, make the final
   commit, and report which operations you applied, how behaviour was verified, and what you left for later.

## The golden rules

1. **Behaviour is preserved.** Refactoring does not change what the code does, only how.
2. **Small steps.** Make tiny changes and test after each one.
3. **Version control is your friend.** Commit before and after each safe state.
4. **Tests are essential.** Without tests you are not refactoring, you are editing.
5. **One thing at a time.** Do not mix refactoring with feature changes.

## When not to refactor

- Code that works and will not change again
- Critical production code without tests (add tests first)
- Under a tight deadline
- "Just because": there must be a clear purpose

## Common code smells and fixes

### 1. Long method or function

```diff
# BAD: 200-line function that does everything
- async function processOrder(orderId) {
-   // 50 lines: fetch order
-   // 30 lines: validate order
-   // 40 lines: calculate pricing
-   // 30 lines: update inventory
-   // 20 lines: create shipment
-   // 30 lines: send notifications
- }

# GOOD: Broken into focused functions
+ async function processOrder(orderId) {
+   const order = await fetchOrder(orderId);
+   validateOrder(order);
+   const pricing = calculatePricing(order);
+   await updateInventory(order);
+   const shipment = await createShipment(order);
+   await sendNotifications(order, pricing, shipment);
+   return { order, pricing, shipment };
+ }
```

### 2. Duplicated code

```diff
# BAD: Same logic in multiple places
- function calculateUserDiscount(user) {
-   if (user.membership === 'gold') return user.total * 0.2;
-   if (user.membership === 'silver') return user.total * 0.1;
-   return 0;
- }
-
- function calculateOrderDiscount(order) {
-   if (order.user.membership === 'gold') return order.total * 0.2;
-   if (order.user.membership === 'silver') return order.total * 0.1;
-   return 0;
- }

# GOOD: Extract common logic
+ function getMembershipDiscountRate(membership) {
+   const rates = { gold: 0.2, silver: 0.1 };
+   return rates[membership] || 0;
+ }
+
+ function calculateUserDiscount(user) {
+   return user.total * getMembershipDiscountRate(user.membership);
+ }
+
+ function calculateOrderDiscount(order) {
+   return order.total * getMembershipDiscountRate(order.user.membership);
+ }
```

### 3. Large class or module

```diff
# BAD: God object that knows too much
- class UserManager {
-   createUser() { /* ... */ }
-   updateUser() { /* ... */ }
-   deleteUser() { /* ... */ }
-   sendEmail() { /* ... */ }
-   generateReport() { /* ... */ }
-   handlePayment() { /* ... */ }
-   validateAddress() { /* ... */ }
-   // 50 more methods...
- }

# GOOD: Single responsibility per class
+ class UserService {
+   create(data) { /* ... */ }
+   update(id, data) { /* ... */ }
+   delete(id) { /* ... */ }
+ }
+ class EmailService { send(to, subject, body) { /* ... */ } }
+ class ReportService { generate(type, params) { /* ... */ } }
+ class PaymentService { process(amount, method) { /* ... */ } }
```

### 4. Long parameter list

```diff
# BAD: Too many parameters
- function createUser(email, password, name, age, address, city, country, phone) {
-   /* ... */
- }

# GOOD: Group related parameters (introduce a parameter object)
+ interface UserData {
+   email: string; password: string; name: string;
+   age?: number; address?: Address; phone?: string;
+ }
+
+ function createUser(data: UserData) {
+   /* ... */
+ }
```

For complex construction with many optional parts, a builder can read even better:
`UserBuilder.email('test@example.com').name('Test User').address(address).build()`.

### 5. Feature envy

```diff
# BAD: Method that uses another object's data more than its own
- class Order {
-   calculateDiscount(user) {
-     if (user.membershipLevel === 'gold') {
-       return this.total * 0.2;
-     }
-     if (user.accountAge > 365) {
-       return this.total * 0.1;
-     }
-     return 0;
-   }
- }

# GOOD: Move logic to the object that owns the data
+ class User {
+   getDiscountRate() {
+     if (this.membershipLevel === 'gold') return 0.2;
+     if (this.accountAge > 365) return 0.1;
+     return 0;
+   }
+ }
+
+ class Order {
+   calculateDiscount(user) {
+     return this.total * user.getDiscountRate();
+   }
+ }
```

### 6. Primitive obsession

```diff
# BAD: Using primitives for domain concepts
- function sendEmail(to, subject, body) { /* ... */ }
- sendEmail('user@example.com', 'Hello', '...');
-
- function createPhone(country, number) {
-   return `${country}-${number}`;
- }

# GOOD: Use domain types
+ class Email {
+   private constructor(public readonly value: string) {
+     if (!Email.isValid(value)) throw new Error('Invalid email');
+   }
+   static create(value: string) { return new Email(value); }
+   static isValid(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
+ }
+
+ class PhoneNumber {
+   constructor(public readonly country: string, public readonly number: string) {
+     if (!PhoneNumber.isValid(country, number)) throw new Error('Invalid phone');
+   }
+   toString() { return `${this.country}-${this.number}`; }
+   static isValid(country: string, number: string) { /* ... */ }
+ }
```

Adding validation that throws is a behaviour change. Introduce the type first without new checks, then add the
validation as a separate, tested change.

### 7. Magic numbers and strings

```diff
# BAD: Unexplained values
- if (user.status === 2) { /* ... */ }
- const discount = total * 0.15;
- setTimeout(callback, 86400000);

# GOOD: Named constants
+ const UserStatus = { ACTIVE: 1, INACTIVE: 2, SUSPENDED: 3 } as const;
+ const DISCOUNT_RATES = { STANDARD: 0.1, PREMIUM: 0.15, VIP: 0.2 } as const;
+ const ONE_DAY_MS = 24 * 60 * 60 * 1000;
+
+ if (user.status === UserStatus.INACTIVE) { /* ... */ }
+ const discount = total * DISCOUNT_RATES.PREMIUM;
+ setTimeout(callback, ONE_DAY_MS);
```

### 8. Nested conditionals

```diff
# BAD: Arrow code
- function process(order) {
-   if (order) {
-     if (order.user) {
-       if (order.user.isActive) {
-         if (order.total > 0) {
-           return processOrder(order);
-         } else {
-           return { error: 'Invalid total' };
-         }
-       } else {
-         return { error: 'User inactive' };
-       }
-     } else {
-       return { error: 'No user' };
-     }
-   } else {
-     return { error: 'No order' };
-   }
- }

# GOOD: Guard clauses / early returns
+ function process(order) {
+   if (!order) return { error: 'No order' };
+   if (!order.user) return { error: 'No user' };
+   if (!order.user.isActive) return { error: 'User inactive' };
+   if (order.total <= 0) return { error: 'Invalid total' };
+   return processOrder(order);
+ }
```

### 9. Dead code

```diff
# BAD: Unused code lingers
- function oldImplementation() { /* ... */ }
- const DEPRECATED_VALUE = 5;
- import { unusedThing } from './somewhere';
- // Commented out code
- // function oldCode() { /* ... */ }

# GOOD: Remove it
+ // Delete unused functions, imports and commented-out code.
+ // If you need it again, the version history has it.
```

Search the whole project (including scripts, configuration and reflection or string-based lookups) before you
declare something unused.

### 10. Inappropriate intimacy

```diff
# BAD: One class reaches deep into another
- class OrderProcessor {
-   process(order) {
-     order.user.profile.address.street;  // Too intimate
-     order.repository.connection.config;  // Breaking encapsulation
-   }
- }

# GOOD: Talk only to direct collaborators (Law of Demeter)
+ class OrderProcessor {
+   process(order) {
+     order.getShippingAddress();  // Order knows how to get it
+     order.save();  // Order knows how to save itself
+   }
+ }
```

## Extract method: before and after

```diff
# Before: One long function
- function printReport(users) {
-   console.log('USER REPORT');
-   console.log('===========');
-   console.log('');
-   console.log(`Total users: ${users.length}`);
-   console.log('');
-   console.log('ACTIVE USERS');
-   console.log('------------');
-   const active = users.filter(u => u.isActive);
-   active.forEach(u => {
-     console.log(`- ${u.name} (${u.email})`);
-   });
-   console.log('');
-   console.log(`Active: ${active.length}`);
-   console.log('');
-   console.log('INACTIVE USERS');
-   console.log('--------------');
-   const inactive = users.filter(u => !u.isActive);
-   inactive.forEach(u => {
-     console.log(`- ${u.name} (${u.email})`);
-   });
-   console.log('');
-   console.log(`Inactive: ${inactive.length}`);
- }

# After: Extracted methods, identical output
+ function printReport(users) {
+   printHeader('USER REPORT');
+   console.log(`Total users: ${users.length}`);
+   console.log('');
+   printUserSection('ACTIVE USERS', 'Active', users.filter(u => u.isActive));
+   console.log('');
+   printUserSection('INACTIVE USERS', 'Inactive', users.filter(u => !u.isActive));
+ }
+
+ function printHeader(title) {
+   console.log(title);
+   console.log('='.repeat(title.length));
+   console.log('');
+ }
+
+ function printUserSection(title, countLabel, users) {
+   console.log(title);
+   console.log('-'.repeat(title.length));
+   users.forEach(u => console.log(`- ${u.name} (${u.email})`));
+   console.log('');
+   console.log(`${countLabel}: ${users.length}`);
+ }
```

Check: the output is identical line for line. Capture it before and after (a snapshot test makes this cheap).

## Introducing type safety

Add types first, without changing logic. New validation, new rates or a new return shape are behaviour changes and
belong in separate, tested steps.

```diff
# Before: No types
- function calculateDiscount(user, total, membership, date) {
-   if (membership === 'gold' && date.getDay() === 5) {
-     return total * 0.25;
-   }
-   if (membership === 'gold') return total * 0.2;
-   return total * 0.1;
- }

# After: Typed, same behaviour
+ type Membership = 'bronze' | 'silver' | 'gold';
+
+ const FRIDAY = 5;
+
+ function calculateDiscount(
+   user: User,             // unused: remove it in a separate step (Remove Parameter)
+   total: number,
+   membership: Membership,
+   date: Date
+ ): number {
+   if (membership === 'gold' && date.getDay() === FRIDAY) {
+     return total * 0.25;
+   }
+   if (membership === 'gold') return total * 0.2;
+   return total * 0.1;
+ }
```

## Design pattern: replace conditional with strategy

Use this when the branches will keep growing or vary independently, not for two stable cases.

```diff
# Before: Conditional logic
- function calculateShipping(order, method) {
-   if (method === 'standard') {
-     return order.total > 50 ? 0 : 5.99;
-   } else if (method === 'express') {
-     return order.total > 100 ? 9.99 : 14.99;
-   } else if (method === 'overnight') {
-     return 29.99;
-   }
- }

# After: Strategy pattern
+ interface ShippingStrategy {
+   calculate(order: Order): number;
+ }
+
+ class StandardShipping implements ShippingStrategy {
+   calculate(order: Order) { return order.total > 50 ? 0 : 5.99; }
+ }
+ class ExpressShipping implements ShippingStrategy {
+   calculate(order: Order) { return order.total > 100 ? 9.99 : 14.99; }
+ }
+ class OvernightShipping implements ShippingStrategy {
+   calculate(order: Order) { return 29.99; }
+ }
+
+ function calculateShipping(order: Order, strategy: ShippingStrategy) {
+   return strategy.calculate(order);
+ }
```

If callers still pass the method as a string, keep a lookup (`{ standard: new StandardShipping(), ... }`) at the
boundary, and keep what an unknown method does today (the code above returns `undefined`).

## Refactoring checklist

**Code quality**
- [ ] Functions are small (under about 50 lines)
- [ ] Functions do one thing
- [ ] No duplicated code
- [ ] Descriptive names (variables, functions, classes)
- [ ] No magic numbers or strings
- [ ] Dead code removed

**Structure**
- [ ] Related code is together
- [ ] Clear module boundaries
- [ ] Dependencies flow in one direction
- [ ] No circular dependencies

**Type safety**
- [ ] Types defined for all public APIs
- [ ] No `any` (or equivalent) without justification
- [ ] Nullable types explicitly marked

**Testing**
- [ ] Refactored code is tested
- [ ] Tests cover edge cases
- [ ] All tests pass without changed expectations

## Common refactoring operations

| Operation                                     | Description                           |
| --------------------------------------------- | ------------------------------------- |
| Extract Method                                | Turn a code fragment into a method    |
| Extract Class                                 | Move behaviour to a new class         |
| Extract Interface                             | Create an interface from an implementation |
| Inline Method                                 | Move a method body back to the caller |
| Inline Class                                  | Move class behaviour to the caller    |
| Pull Up Method                                | Move a method to the superclass       |
| Push Down Method                              | Move a method to a subclass           |
| Rename Method/Variable                        | Improve clarity                       |
| Introduce Parameter Object                    | Group related parameters              |
| Replace Conditional with Polymorphism         | Use polymorphism instead of switch/if |
| Replace Magic Number with Constant            | Named constants                       |
| Decompose Conditional                         | Break up complex conditions           |
| Consolidate Conditional                       | Combine duplicate conditions          |
| Replace Nested Conditional with Guard Clauses | Early returns                         |
| Introduce Null Object                         | Eliminate null checks                 |
| Replace Type Code with Class/Enum             | Strong typing                         |
| Replace Inheritance with Delegation           | Composition over inheritance          |

## Red flags

- Tests had to be changed to make the refactoring pass (behaviour probably changed)
- A refactoring commit that also adds a feature or fixes a bug
- A large untested change instead of many small tested ones
- A design pattern introduced for two stable cases
- Public names or signatures changed without updating every caller and the docs

---
Adapted from Refactor by AungMyoKyaw for github/awesome-copilot, copyright GitHub, Inc. (https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/refactor/SKILL.md), MIT.
Changes: condensed from 645 to under 500 lines, added Goal and Steps, fixed broken diffs and examples that changed behaviour, dropped two weak patterns. See SOURCE.md.
