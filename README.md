# networkPerformance-review
 
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)

## Features

- **Three Different View:**
  - Default View : Quickly view the performance of each metric by date.
  - Dashboard View : Interactively compare different metrics to gain insights.
  - Report View : Deeply compare the content of each data entry.

|  | Default | Dashboard  | Report  |
|:---------:|:---------:|:---------:|:---------:|
| Date Range Selection | ✅ | ✅ | ✅ |
| Currency Change | ✅ | ✅ | ✅ |
| Matric switch | ✅ | ✅ |  |
| Metric vs. datetime | ✅ | ✅ |  |
| eCPM top 10 |  | ✅ |  |
| RPM top 10 |  | ✅ |  |
| RPM top 10 |  | ✅ |  |
| Impression vs. request |  | ✅ |  |
| Table | ✅ | | ✅ |
| Sortable | ✅ | | ✅ |
| Avg. Compare | | | ✅ |
| Download | | | ✅(xlsx) |

## Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/MattWangTaiwan/networkPerformance-review.git
cd networkPerformance-review
# npm
npm install

# yarn
yarn install
```

## Usage

To start the development server:

```bash
# npm
npm run dev

#yarn
yarn dev

http://localhost:5173
```

## Technologies
- **Vue.js 3.4**
- **tailwindcss 3.4**
- **xstate:** Plan interface states and switch according to the established state flow.
- **sql.js:** Used to temporarily store data and perform efficient searches to meet interface display requirements.
- **echarts:** Visualization library to create interactive charts.
- **vxe-table:** Vue.js component for creating feature-rich and flexible tables.
