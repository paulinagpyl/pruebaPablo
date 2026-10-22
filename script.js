    document.getElementById("year").textContent = new Date().getFullYear();

    const weatherStatus = document.getElementById("weather-status");
    const forecast = document.getElementById("forecast");
    const weatherDescriptions = {
      0: ["Despejado", "☀️"],
      1: ["Mayormente despejado", "🌤️"],
      2: ["Parcialmente nublado", "⛅"],
      3: ["Nublado", "☁️"],
      45: ["Niebla", "🌫️"],
      48: ["Niebla con escarcha", "🌫️"],
      51: ["Llovizna ligera", "🌦️"],
      53: ["Llovizna", "🌦️"],
      55: ["Llovizna intensa", "🌧️"],
      56: ["Llovizna helada ligera", "🌧️"],
      57: ["Llovizna helada intensa", "🌧️"],
      61: ["Lluvia ligera", "🌦️"],
      63: ["Lluvia", "🌧️"],
      65: ["Lluvia intensa", "🌧️"],
      66: ["Lluvia helada ligera", "🌧️"],
      67: ["Lluvia helada intensa", "🌧️"],
      71: ["Nieve ligera", "🌨️"],
      73: ["Nieve", "🌨️"],
      75: ["Nieve intensa", "❄️"],
      77: ["Granizo pequeño", "🌨️"],
      80: ["Chubascos ligeros", "🌦️"],
      81: ["Chubascos", "🌧️"],
      82: ["Chubascos intensos", "🌧️"],
      85: ["Chubascos de nieve", "🌨️"],
      86: ["Chubascos de nieve intensos", "🌨️"],
      95: ["Tormenta", "⛈️"],
      96: ["Tormenta con granizo", "⛈️"],
      99: ["Tormenta intensa con granizo", "⛈️"],
    };
    async function loadForecast() {
      weatherStatus.textContent = "Cargando resumen de cinco días…";
      forecast.replaceChildren();
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-33.0472&longitude=-71.6127&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&wind_speed_unit=kn&forecast_days=5&timezone=America%2FSantiago",
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const days = data.daily;
        if (!days || !Array.isArray(days.time) || days.time.length < 5)
          throw new Error("Pronóstico incompleto");
        const dateFormatter = new Intl.DateTimeFormat("es-CL", {
          weekday: "short",
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        });
        days.time.slice(0, 5).forEach((date, index) => {
          const [description, icon] = weatherDescriptions[
            days.weather_code[index]
          ] || ["Variable", "🌤️"];
          const day = document.createElement("article");
          day.className = "forecast-day";
          const heading = document.createElement("h3");
          heading.textContent = dateFormatter.format(
            new Date(`${date}T12:00:00Z`),
          );
          const symbol = document.createElement("div");
          symbol.className = "forecast-icon";
          symbol.setAttribute("aria-hidden", "true");
          symbol.textContent = icon;
          const summary = document.createElement("p");
          summary.className = "forecast-description";
          summary.textContent = description;
          const temperatures = document.createElement("div");
          temperatures.className = "forecast-temperatures";
          temperatures.textContent = `${Math.round(days.temperature_2m_max[index])}° / ${Math.round(days.temperature_2m_min[index])}°`;
          const wind = document.createElement("p");
          wind.className = "forecast-details";
          wind.textContent = `Viento máx.: ${typeof days.wind_speed_10m_max?.[index] === "number" ? Math.round(days.wind_speed_10m_max[index]) + " nudos" : "s/d"}`;
          day.append(heading, symbol, summary, temperatures, wind);
          forecast.append(day);
        });
        weatherStatus.textContent =
          "Resumen diario para los próximos cinco días · Temperaturas máxima/mínima y viento máximo";
      } catch (error) {
        console.error("No se pudo cargar el pronóstico del tiempo:", error);
        weatherStatus.textContent =
          "No se pudo cargar el pronóstico. Revisa tu conexión e inténtalo nuevamente.";
        const retry = document.createElement("button");
        retry.className = "btn btn-primary";
        retry.type = "button";
        retry.textContent = "Reintentar";
        retry.addEventListener("click", loadForecast);
        forecast.append(retry);
      }
    }
    loadForecast();

    document
      .getElementById("contact-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!(form instanceof HTMLFormElement) || !form.reportValidity())
          return;
        const name = form.elements.namedItem("name").value.trim();
        const contact = form.elements.namedItem("contact").value.trim();
        const message = form.elements.namedItem("message").value.trim();
        const text = `Hola, soy ${name}.\nMi contacto: ${contact}\n\n${message}`;
        const whatsappUrl = `https://wa.me/56993145696?text=${encodeURIComponent(text)}`;
        const whatsappWindow = window.open(whatsappUrl, "_blank");
        const status = document.getElementById("contact-status");
        status.replaceChildren();
        if (whatsappWindow) {
          whatsappWindow.opener = null;
          status.textContent =
            "Se abrió WhatsApp. Revisa el mensaje y presiona enviar.";
          form.reset();
        } else {
          status.textContent = "Abriendo WhatsApp…";
          window.location.assign(whatsappUrl);
        }
      });