import React, { useState, useEffect, useCallback } from "react";
import Plot from "react-plotly.js";
import { useHttp } from "../../hooks/http.hook";
import "./Stock.css";

export const Stock = () => {
  const API_KEY = "HGJWFG4N8AQ66ICD";
  const { loading, error, request, clearError } = useHttp();
  const defaultTicket = "AAPL";
  const [form, setForm] = useState({ companyMarketSymbol: defaultTicket });
  const [chartTitle, setChartTitle] = useState(defaultTicket);
  const [stockChart, setStockChart] = useState({
    stockChartXValues: [],
    stockChartYValues: [],
  });
  const [firstLoad, setFirstLoad] = useState(true);

  const changeHandler = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const getChartData = useCallback(
    async (event) => {
      if (event) event.preventDefault();
      if (error) clearError();
      try {
        let stockChartXValuesFunction = [],
          stockChartYValuesFunction = [];
        const data = await request(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${form.companyMarketSymbol}&outputsize=compact&apikey=${API_KEY}`
        );

        for (var key in data["Time Series (Daily)"]) {
          stockChartXValuesFunction.push(key);
          stockChartYValuesFunction.push(
            data["Time Series (Daily)"][key]["4. close"]
          );
        }

        setStockChart({
          stockChartXValues: stockChartXValuesFunction,
          stockChartYValues: stockChartYValuesFunction,
        });

        setChartTitle(form.companyMarketSymbol);
      } catch (e) {}
    },
    [form, request, error, clearError]
  );

  useEffect(() => {
    if (firstLoad) {
      getChartData();
      setFirstLoad(false);
    }
  }, [firstLoad, setFirstLoad, getChartData]);

  return (
    <div>
      <h1>Stock Market</h1>

      <div className="group">
        <form onSubmit={getChartData}>
          <input
            type="text"
            name="companyMarketSymbol"
            onChange={changeHandler}
            required
          />
          <span className="bar"></span>
          <label>Company Market Ticket</label>
          {/* <button type="button" onClick={getChartData} disabled={loading}>
          Search
        </button> */}
          <a href={"/"} onClick={getChartData} className="boot">
            Search
          </a>
        </form>
      </div>

      {!loading && !error ? (
        <Plot
          data={[
            {
              x: stockChart.stockChartXValues,
              y: stockChart.stockChartYValues,
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "black" },
            },
          ]}
          layout={{
            width: 1280,
            height: 720,
            title: chartTitle,
          }}
        />
      ) : (
        error
      )}
    </div>
  );
};
