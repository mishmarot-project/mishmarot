# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Mishmarot, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: security@mishmarot.org (to be configured)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

We will acknowledge receipt within 48 hours and provide a timeline for a fix.

## Scope

The following are in scope:
- The Mishmarot web application and API
- Ingestion workers and data pipelines
- Authentication and access control mechanisms
- Data privacy and geographic suppression logic

## Data Sensitivity

This platform handles data about hate crimes targeting Jewish communities. Security vulnerabilities that could expose:

- Precise incident locations (bypassing geographic suppression)
- Victim identifying information
- Unverified/retracted incident data
- Partner-tier data to unauthorized users

...are treated with the highest priority.
