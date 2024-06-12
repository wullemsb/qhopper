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
Enter your RabbitMQ server details and click save

![Recording 2024-06-12 120034](https://github.com/kubatemer/qhopper-test/assets/71670720/6ab0386c-9819-498e-a78b-39ab750fc224)

After you have made a successful connection, you should be able to see your vhosts and queues in the sidebar. Refresh rate will be set OFF as default. This is only for refreshing the sidebar, not the messages.

![sidebar](https://github.com/kubatemer/qhopper/assets/71670720/434551e8-0661-4a66-b32f-81890cc83c58)
#

### Displaying message details
Clicking on the arrow will expand the panel displaying additional details.

![electron_UODYePeWGK](https://github.com/kubatemer/qhopper/assets/71670720/d665ca3c-5793-41e5-8a19-78ce591f6c2b)
#

### Moving messages
Check the boxes of the desired messages to be moved and drag them to the target queue.

![electron_nXpm85UMwX](https://github.com/kubatemer/qhopper/assets/71670720/63f87a2a-bcb1-4d53-91d9-14175b6f203e)
#

### Filtering by date
Choose the date range in the input and click the filter button. Using the clear button will remove the filter and display all messages.

![electron_wpDyx0NCRN](https://github.com/kubatemer/qhopper/assets/71670720/3e403562-fdb4-4ab6-beb5-520199fa9be7)
#
