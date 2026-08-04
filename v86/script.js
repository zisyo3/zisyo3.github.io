window.onload = function() {
  var emulator;
  try {
    // v86の起動設定
    emulator = new V86({
        wasm_path: "/v86/v86.wasm",
        screen_container: document.getElementById("screen_container"),
        memory_size: 32 * 1024 * 1024,
        hda: {
          size: 512 * 1024 * 1024, 
          async_storage_browser: true 
        },
        cdrom: { url: "images/linux.iso" }, 
        bios: { url: "bios/seabios.bin" }, 
        vga_bios: { url: "bios/vgabios.bin" },
        /*filesystem:{ baseurl: "path/" },*/
        network_relay_url:"wss://wisp.mercurywork.shop/",
        autostart: true,
    });

    var stateDisplay = document.getElementById("state");
    function mainLoop(){
      if(emulator && emulator.is_running() == true){
        stateDisplay.textContent = "Power:ON";
      }else{
        stateDisplay.textContent = "Power:OFF";
      }
      requestAnimationFrame(mainLoop);
    }
    mainLoop();

  } catch (error) {
    alert(
      error.name +"\n" +
      error.message +"\n" +
      error.stack +"\n"
    );
  }
  //Paste
  document.getElementById("paste_button").onclick = async function() {
    try {
      // ブラウザのクリップボードからテキストを読み取る
      const text = await navigator.clipboard.readText();
    
      if (emulator && text) {
        emulator.serial0_send(text);
      }
      } catch (err) {
        alert("Paste Error:\n" + err);
      }
  };
};
