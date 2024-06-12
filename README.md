# QHopper

## Overview
QHopper is a desktop application built with Angular and Electron, designed to interact with RabbitMQ. It allows you to view vhosts, queues, queue message counts, and message details. You can also move messages and filter them by date.

## Features
- Connect to RabbitMQ: Easily connect to your RabbitMQ server.
- View Vhosts: See a list of your virtual hosts.
- Manage Queues: Access and view your queues.
- Message Counts: View the number of messages in each queue.
- Message Details: Inspect details of individual messages.
- Move Messages: Move messages between queues.
- Filter by Date: Filter messages based on their date.




## Setup
Prerequisites
- RabbitMQ Server
#
1. Clone the repository:
```
git clone https://ordina-ncore@dev.azure.com/ordina-ncore/Young%20Professionals/_git/QHopper
```

2. Install dependencies:
```
npm install
```
3. Run application:
```
npm run build-electron
```
## Usage
### Connecting to RabbitMQ
![Recording 2024-06-12 120034](https://github.com/kubatemer/qhopper-test/assets/71670720/6ab0386c-9819-498e-a78b-39ab750fc224)
1. Enter your RabbitMQ server details and click save
