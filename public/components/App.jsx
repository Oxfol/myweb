function App() {
  return (
    <>
      <Hero />
      <Capabilities />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
window.App = App;
