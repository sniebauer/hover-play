# Hover! music synthesizer distribution

`libfluidsynth-2.4.6.js` is the unmodified, separately loaded WebAssembly build
distributed in `js-synthesizer@1.13.0` (SHA-256
`42ece3b53ef3289a3b30e0e1ebb4951e9da9987ae6ca975c57a0aabc91237f66`).
It is licensed under the GNU Lesser General Public License 2.1; see
[the full license](LICENSE.fluidsynth.txt).

Matching source and build instructions are available alongside the module:

- [FluidSynth with Emscripten patches, source archive](fluidsynth-emscripten-2.4.6-em-2-source.tar.gz),
  upstream `jet2jet/fluidsynth-emscripten`, tag `v2.4.6-em-2`, commit
  `99bf7094cf517095b7a944ccf5f74072436bfa3f`.
- [Distributor source archive](js-synthesizer-build-source.tar.gz),
  upstream `jet2jet/js-synthesizer`, commit
  `5052389aca8f3c73701a972cc6c96abce76faddf`. Its copy of the distributed
  `externals/libfluidsynth-2.4.6.js` is byte-identical to the module here.
  The distributor's [BSD license](LICENSE.js-synthesizer.txt) is included.

The FluidSynth archive includes its C/C++ source, Emscripten glue, CMake files,
and README build instructions. The upstream instructions use `emcmake cmake`
followed by `emmake make`; disable libsndfile for this SF2-only build.
The module remains a separate file and can be replaced with a compatible
modified build. Hover's MIDI scheduler and worklet adapter call its exported
API; the application is not bundled into this library.

The sound bank is [GeneralUser GS 2.0.3](../GeneralUser-GS-LICENSE.txt) by
S. Christian Collins. [soundfont.json](../soundfont.json) identifies its pinned
source, complete SHA-256, and two lossless parts. Concatenating the parts in
manifest order reconstructs the original SF2 exactly. Splitting keeps every
asset below Cloudflare's per-file limit. This is a replacement bank, not a
capture of a particular original Windows MIDI device.
