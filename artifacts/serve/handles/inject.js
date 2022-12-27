const debug = require("debug")("inject:serve");
const { parse, join, resolve, sep, posix } = require("node:path");
const { readdir, stat } = require("node:fs/promises");

const { Chart, ChartFile, File } = require("./model.js").models;

const STATIC_ROOT = resolve(__dirname, "..", "static");
const STATIC_ROOT_POSIX = STATIC_ROOT.split(sep).join("/");

let description = {
    v1: "HadCRUT5 is a gridded dataset of global historical surface temperature anomalies relative to a 1961-1990 reference period. Data are available for each month from January 1850 onwards, on a 5 degree grid and as global and regional average time series. The dataset is a collaborative product of the Met Office Hadley Centre and the Climatic Research Unit at the University of East Anglia.\n" +
        "\n" +
        "The current version of HadCRUT5 is HadCRUT.5.0.1.0, available from the download page.\n" +
        "\n" +
        "link: https://www.metoffice.gov.uk/hadobs/hadcrut5/\n",
    v2: "Northern Hemisphere temperature reconstruction for the past 2,000 years by combining low-resolution proxies with tree-ring data, using a wavelet transform technique to achieve timescale-dependent processing of the data.\n" +
        "\n" +
        "link: https://eur02.safelinks.protection.outlook.com/GetUrlReputation\n",
    v3: "The graphs show monthly mean carbon dioxide measured at Mauna Loa Observatory, Hawaii. The carbon dioxide data on Mauna Loa constitute the longest record of direct measurements of CO2 in the atmosphere.\n" +
        "\n" +
        "link: https://gml.noaa.gov/ccgg/trends/\n",
    v4: "The CO2 records presented here are derived from three ice cores obtained at Law Dome, East Antarctica from 1987 to 1993.\n" +
        "\n" +
        "link: https://cdiac.ess-dive.lbl.gov/trends/co2/lawdome.html\n",
    v5: "In January 1998, the collaborative ice-drilling project between Russia, the United States, and France at the Russian Vostok station in East Antarctica yielded the deepest ice core ever recovered, reaching a depth of 3,623 m (Petit et al. 1997, 1999).\n" +
        "\n" +
        "link: https://cdiac.ess-dive.lbl.gov/trends/co2/vostok.html\n",
    v6: "Bereiter, B., S. Eggleston, J. Schmitt, C. Nehrbass-Ahles, T. F. Stocker, H. Fischer, S. Kipfstuhl, J. Chappellaz. 2015. Revision of the EPICA Dome C CO2 record from 800 to 600kyr before present. Geophysical Research Letters, 42(2), 542-549. doi: 10.1002/2014GL061957.\n" +
        "\n" +
        "link: https://www.ncei.noaa.gov/access/paleo-search/study/17975\n",
    v7: "Reconstructions of Earth’s past climate strongly influence our understanding of the dynamics and sensitivity of the climate system.\n" +
        "\n" +
        "link: https://climate.fas.harvard.edu/files/climate/files/snyder_2016.pdf\n",
    v8: "Accurate assessment of anthropogenic carbon dioxide (CO2) emissions and their redistribution among the atmosphere, ocean, and terrestrial biosphere in a changing climate is critical to better understand the global carbon cycle, support the development of climate policies, and project future climate change.\n" +
        "\n" +
        "link: https://essd.copernicus.org/articles/14/1917/2022/\n",
    v9: "CO2 emissions\n" +
        "\n" +
        "link: https://ourworldindata.org/emissions-by-sector#co2-emissions-by-sector\n",
};

async function* collect(root) {
    for (const file of await readdir(root)) {
        const fullPath = join(root, file);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) yield* collect(fullPath);
        if (stats.isFile()) yield fullPath;
    }
}

module.exports = async ({ userId }) => {
    const charts = [], chartFiles = [], files = [];
    for (let i = 1; i <= 10; i++) {
        const folderName = `base${`0${i}`.slice(-2)}`, tempFiles = [], tempChartFile = [];
        const tempChart = { id: folderName, name: `v${i}`, description: description[`v${i}`], userId };
        for await (const tempFile of collect(join(STATIC_ROOT, folderName))) {
            const normalizePath = tempFile.split(sep);
            const url = posix.relative(STATIC_ROOT_POSIX.slice(0, -6), normalizePath.join("/"));
            tempFiles.push({ url, name: parse(tempFile).name, strategy: "local", owner: normalizePath.slice(-2, -1) });
            tempChartFile.push({ fileUrl: url, chartId: folderName });
        }
        debug("add %o with file: %o", tempChart, tempFiles);
        charts.push(tempChart);
        files.push(...tempFiles);
        chartFiles.push(...tempChartFile);
    }
    await Promise.all([
        Chart.bulkCreate(charts), // individual hook is not required
        File.bulkCreate(files)
    ]);
    await ChartFile.bulkCreate([
        ...chartFiles,
        { fileUrl: "static/base03/Co2Annual.csv", chartId: "base04" },
        { fileUrl: "static/base03/Co2Monthly.csv", chartId: "base04" }
    ]);
};
