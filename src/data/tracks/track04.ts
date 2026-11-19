import { TRACK04_EXAM_TRUTH } from '@/lib/datasets';
import type { TrackSpec } from '@/types/curriculum';

export const TRACK_04: TrackSpec = {
  id: 'track-04',
  number: 4,
  shortLabel: '04',
  name: 'Deep Learning',
  categoryLabel: 'Deep Learning',
  subtitle:
    'Math Foundations First -> Perceptron/MLP -> Backprop & Gradient Descent -> CNN -> RNN/LSTM -> Transformer -> Generative Models',
  badgeHex: '#F19BB6',
  prerequisiteTrackId: 'track-03',
  pdfSourceLabel: 'Module 04 — Deep Learning: Math Foundations & All Architectures',
  libraries: ['numpy', 'pytorch', 'torchvision', 'transformers'],
  module_wrapup: {
    certificate_title: 'Deep Learning & Neural Architectures',
    certificate_subtitle:
      'Mastered neural math foundations, activations, backpropagation, CNNs, RNN/LSTMs, Transformers, and generative latent models.',
    key_takeaways: [
      'Every neuron starts with a simple linear equation z = w · x + b; gradients (derivatives) tell weights which direction reduces error.',
      'Non-linear activations (ReLU, Sigmoid, Softmax) allow stacked layers to bend decision boundaries instead of collapsing into one straight line.',
      'Backpropagation applies the chain rule backward, while Gradient Descent / Adam update weights with a carefully chosen learning rate.',
      'Match architecture to modality: CNNs for spatial grids/images, RNN/LSTMs for sequential memory, Transformers for parallel global Self-Attention, and Autoencoders/VAE/Diffusion for latent representation & generation.',
    ],
    quick_reference_headers: ['Architecture / Concept', 'Core Mechanism & Best Use Case'],
    quick_reference_rows: [
      ['Math & Perceptron', 'z = w · x + b, chain rule dL/dw = (dL/dy)(dy/dw), ReLU/Sigmoid/Softmax, MSE & Cross-Entropy.'],
      ['Backprop & GD', 'w_new = w - lr * grad; too small = slow crawl, too large = divergence; Adam adapts per-weight lr.'],
      ['CNN (Vision)', 'Sliding kernel dot-products + stride/padding + pooling extract hierarchical visual features.'],
      ['RNN & LSTM', 'Recurrent hidden state h_t carries sequence memory; LSTM forget/input/output gates fight vanishing gradients.'],
      ['Transformer', 'Scaled Dot-Product Attention softmax(Q @ K^T / sqrt(d_k)) @ V connects all tokens in parallel.'],
      ['Autoencoder / VAE / Diffusion', 'Compress to latent bottleneck z, sample z = mu + sigma * eps, or iteratively denoise images.'],
    ],
  },
  subModules: [
    {
      id: '4.1',
      trackId: 'track-04',
      order: 1,
      code: '4.1',
      title: 'Math Foundations of Neural Networks',
      subtitle: 'Weighted sums z = w·x + b, dot products, derivatives/gradients, and chain rule intuition.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Easy',
      estMinutes: 20,
      theory: {
        intro:
          'Deep Learning is not magic—it is built on two approachable math ideas: **linear combinations** (`z = w · x + b`) and **derivatives (slopes)** that tell us how nudging a weight changes the error.',
        why_it_matters:
          'When you understand dot products and the chain rule (`dL/dw = dL/dz * dz/dw`), backpropagation and PyTorch `.backward()` become completely transparent.',
        history_brief:
          'Calculus (Newton & Leibniz) and linear algebra form the exact engine behind every modern LLM and vision model.',
        visual_diagram_id: 'dl-math-neuron',
        key_rule: 'A positive gradient `dL/dw > 0` means increasing `w` increases error—so we step in the OPPOSITE direction (`-gradient`).',
        syntax_breakdown: [
          { token: 'Dot Product', syntax: 'z = float(np.dot(w, x) + b)', description: 'Computes the weighted sum plus bias.' },
          { token: 'Derivative', syntax: 'slope = 2 * (y_hat - y)', description: 'Measures how fast squared error changes.' },
          { token: 'Chain Rule', syntax: 'dL_dw = dL_dz * x', description: 'Multiplies local slopes along the computation path.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute a neuron’s weighted sum `z = w · x + b` using `np.dot`.',
        codeTemplate: `z = np.___0___(weights, inputs) + ___1___`,
        blanks: [
          { id: 'b0', answer: 'dot', placeholder: 'op' },
          { id: 'b1', answer: 'bias', placeholder: 'offset' },
        ],
        wordBank: ['dot', 'bias', 'sum', 'relu', 'grad'],
        hint: 'Use `np.dot(weights, inputs) + bias`.',
        explanation: 'Every dense neural layer repeats `w · x + b` thousands of times in parallel.',
      },
      challenge: {
        id: 'chal-4-1',
        difficulty_kyu: '5 Kyu',
        xp_reward: 190,
        title: 'Neuron Linear Equation & Chain-Rule Gradient',
        instructions:
          'Implement `linear_neuron(x, w, b)` returning `float(np.dot(x, w) + b)` and `chain_rule_grad(x, y_hat, y_true)` returning `(dL_dw, dL_db)` for squared error `L = (y_hat - y_true)^2`.',
        requirements: [
          '`linear_neuron(x, w, b)` returns the scalar weighted sum `w · x + b`.',
          '`chain_rule_grad(x, y_hat, y_true)` computes `dL_dz = 2 * (y_hat - y_true)`, `dL_dw = dL_dz * np.array(x)`, and `dL_db = float(dL_dz)`.',
        ],
        starter_file_url: '/starters/track04_01_math.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Math Foundation Tests Pass',
        default_tasks: [
          'Compute weighted sum with np.dot(x, w) + b.',
          'Apply the chain rule dL/dw = 2*(y_hat - y_true)*x.',
        ],
        starter_code: `import numpy as np

def linear_neuron(x, w, b):
    # Return float(np.dot(x, w) + b)
    pass

def chain_rule_grad(x, y_hat, y_true):
    # For L = (y_hat - y_true)**2, return (dL_dw, dL_db)
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.1-s1',
              name: 'Computes linear neuron weighted sum accurately',
              visibility: 'sample',
              testCode: `
z = linear_neuron(np.array([2.0, 3.0]), np.array([0.5, -1.0]), 1.5)
assert abs(z - (-0.5)) < 1e-6, f"Expected -0.5, got {z}"
`,
            },
            {
              id: '4.1-s2',
              name: 'Computes exact chain-rule gradients dL/dw and dL/db',
              visibility: 'sample',
              testCode: `
dw, db = chain_rule_grad(np.array([2.0, -1.0]), y_hat=5.0, y_true=3.0)
assert np.allclose(dw, [8.0, -4.0])
assert abs(db - 4.0) < 1e-6
`,
            },
            {
              id: '4.1-h1',
              name: 'Zero error produces zero gradients',
              visibility: 'hidden',
              testCode: `
dw, db = chain_rule_grad(np.array([4.0, 7.0]), y_hat=2.5, y_true=2.5)
assert np.allclose(dw, [0.0, 0.0]) and abs(db) < 1e-6
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'A neuron computes a weighted sum `z = w · x + b`.',
          'The chain rule multiplies local derivatives so every weight learns how much it contributed to the error.',
        ],
        reflection_prompt: 'Why is `dL/dw` zero when your prediction `y_hat` already equals `y_true`?',
      },
    },
    {
      id: '4.2',
      trackId: 'track-04',
      order: 2,
      code: '4.2',
      title: 'Perceptron, MLP, Activations & Loss Functions',
      subtitle: 'Forward pass, ReLU, Sigmoid, Softmax, and choosing MSE vs Cross-Entropy loss.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'Stacking linear layers without an activation function is useless—a linear function of a linear function is still just a straight line! **Activation functions** (`ReLU`, `Sigmoid`, `Softmax`) inject non-linearity so Multi-Layer Perceptrons (MLPs) can learn curves and complex patterns.',
        why_it_matters:
          'Choosing the right output activation + loss pair is essential: Regression uses Linear + `MSE`, Binary Classification uses `Sigmoid` + Binary Cross-Entropy, and Multi-Class uses `Softmax` + Cross-Entropy.',
        history_brief:
          'ReLU (`max(0, x)`) unlocked deep networks in the 2010s by solving the vanishing gradient problem of Sigmoid hidden layers.',
        visual_diagram_id: 'dl-mlp-activations',
        key_rule: 'Use `ReLU` in hidden layers, `Sigmoid` for binary probability, and `Softmax` for multi-class probabilities summing to 1.0.',
        syntax_breakdown: [
          { token: 'ReLU', syntax: 'np.maximum(0.0, z)', description: 'Zeroes negative values while keeping positive signals linear.' },
          { token: 'Softmax', syntax: 'exp_z / np.sum(exp_z)', description: 'Converts raw logits into probabilities summing to 1.0.' },
          { token: 'MSE Loss', syntax: 'np.mean((y_pred - y_true) ** 2)', description: 'Measures average squared regression error.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Implement ReLU activation and stable Softmax probability normalization.',
        codeTemplate: `h = np.___0___(0.0, z)\nprobs = np.exp(logits - np.max(logits))\nprobs = probs / np.___1___(probs)`,
        blanks: [
          { id: 'b0', answer: 'maximum', placeholder: 'fn' },
          { id: 'b1', answer: 'sum', placeholder: 'norm' },
        ],
        wordBank: ['maximum', 'sum', 'mean', 'max', 'clip'],
        hint: 'Use `np.maximum(0.0, z)` for element-wise ReLU and `np.sum(probs)` for Softmax.',
        explanation: 'Subtracting `np.max(logits)` before `np.exp` prevents numerical overflow without changing Softmax probabilities.',
      },
      challenge: {
        id: 'chal-4-2',
        difficulty_kyu: '4 Kyu',
        xp_reward: 210,
        title: 'Activation & Loss Function Toolkit',
        instructions:
          'Implement `relu(z)`, `softmax(logits)`, and `cross_entropy_loss(probs, target_idx)` (negative log-likelihood `-np.log(probs[target_idx] + 1e-12)`).',
        requirements: [
          '`relu(z)` returns `np.maximum(0.0, z)`.',
          '`softmax(logits)` returns numerically stable probabilities summing to `1.0`.',
          '`cross_entropy_loss(probs, target_idx)` returns `-float(np.log(probs[target_idx] + 1e-12))`.',
        ],
        starter_file_url: '/starters/track04_02_activations.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Activation & Loss Tests Pass',
        default_tasks: [
          'Implement element-wise ReLU with np.maximum.',
          'Implement numerically stable Softmax.',
          'Compute Cross-Entropy loss for target_idx.',
        ],
        starter_code: `import numpy as np

def relu(z):
    pass

def softmax(logits):
    pass

def cross_entropy_loss(probs, target_idx):
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.2-s1',
              name: 'ReLU zeroes negatives and keeps positives',
              visibility: 'sample',
              testCode: `
out = relu(np.array([-3.0, 0.0, 2.5]))
assert np.allclose(out, [0.0, 0.0, 2.5])
`,
            },
            {
              id: '4.2-s2',
              name: 'Softmax outputs valid probability distribution summing to 1',
              visibility: 'sample',
              testCode: `
p = softmax(np.array([1.0, 2.0, 3.0]))
assert abs(np.sum(p) - 1.0) < 1e-6 and p[2] > p[1] > p[0]
`,
            },
            {
              id: '4.2-h1',
              name: 'Cross-Entropy is near 0 for confident correct predictions and high for wrong ones',
              visibility: 'hidden',
              testCode: `
low = cross_entropy_loss(np.array([0.05, 0.95]), 1)
high = cross_entropy_loss(np.array([0.05, 0.95]), 0)
assert low < 0.1 and high > 2.5
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'ReLU adds fast non-linearity to hidden MLP layers.',
          'Softmax + Cross-Entropy is the universal pairing for multi-class classification and next-token LLM prediction.',
        ],
        reflection_prompt: 'What happens if you stack 5 neural layers with zero activation functions?',
      },
    },
    {
      id: '4.3',
      trackId: 'track-04',
      order: 3,
      code: '4.3',
      title: 'Backpropagation & Gradient Descent',
      subtitle: 'Error flow backward, weight updates, learning rate sensitivity, and Momentum / Adam intuition.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'Imagine standing on a foggy mountain valley trying to reach the lowest point (minimum loss). **Backpropagation** computes the slope under your feet, and **Gradient Descent** takes a step downhill: `w = w - lr * grad`.',
        why_it_matters:
          'Learning rate (`lr`) is the single most critical Deep Learning hyperparameter: too tiny = training crawls forever; too large = weights bounce wildly and diverge to `NaN`. Optimizers like **Adam** adapt step sizes automatically.',
        history_brief:
          'Rumelhart, Hinton & Williams (1986) popularized backpropagation; Kingma & Ba (2014) introduced Adam, now the default optimizer in PyTorch.',
        visual_diagram_id: 'dl-gradient-descent',
        key_rule: 'Every training step follows the sacred 4-step rhythm: Forward -> Loss -> Backward (`dL/dw`) -> Optimizer Step (`w -= lr * grad`).',
        syntax_breakdown: [
          { token: 'GD Update', syntax: 'w = w - lr * grad', description: 'Moves weights downhill opposite the gradient.' },
          { token: 'Momentum', syntax: 'v = beta * v + grad; w -= lr * v', description: 'Smooths noisy gradients like a rolling ball.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Perform one Gradient Descent update step subtracting `lr * grad` from `w`.',
        codeTemplate: `w_next = w ___0___ lr * ___1___`,
        blanks: [
          { id: 'b0', answer: '-', placeholder: 'sign' },
          { id: 'b1', answer: 'grad', placeholder: 'slope' },
        ],
        wordBank: ['-', 'grad', '+', 'loss', 'epoch'],
        hint: 'To go downhill, subtract `lr * grad`.',
        explanation: 'Adding `+ lr * grad` would climb UP the loss hill (gradient ascent) instead of minimizing error.',
      },
      challenge: {
        id: 'chal-4-3',
        difficulty_kyu: '4 Kyu',
        xp_reward: 220,
        title: 'Gradient Descent Valley Optimizer',
        instructions:
          'Implement `train_linear_gd(x, y, lr=0.05, steps=50)` starting from `w = 0.0, b = 0.0` to minimize MSE `mean((w*x + b - y)^2)` and return `{"w": w, "b": b, "final_loss": loss}`.',
        requirements: [
          'Initialize `w = 0.0` and `b = 0.0`.',
          'For each step, compute `err = (w * x + b) - y`, `dw = 2 * np.mean(err * x)`, `db = 2 * np.mean(err)`.',
          'Update `w -= lr * dw` and `b -= lr * db`.',
          'Return final `w`, `b`, and `final_loss = float(np.mean(((w * x + b) - y) ** 2))`.',
        ],
        starter_file_url: '/starters/track04_01_backprop.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Backprop & GD Tests Pass',
        default_tasks: [
          'Compute prediction error err = (w * x + b) - y.',
          'Compute gradients dw and db, then update w and b for steps iterations.',
        ],
        starter_code: `import numpy as np

def train_linear_gd(x, y, lr=0.05, steps=50):
    w, b = 0.0, 0.0
    # Run gradient descent loop and return {"w": w, "b": b, "final_loss": ...}
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.3-s1',
              name: 'Converges closely to y = 2x + 1',
              visibility: 'sample',
              testCode: `
x = np.array([1.0, 2.0, 3.0, 4.0])
y = 2.0 * x + 1.0
out = train_linear_gd(x, y, lr=0.05, steps=200)
assert out["final_loss"] < 0.01, f"Loss too high: {out['final_loss']}"
assert abs(out["w"] - 2.0) < 0.1 and abs(out["b"] - 1.0) < 0.2
`,
            },
            {
              id: '4.3-s2',
              name: 'Loss decreases dramatically compared to starting w=0, b=0',
              visibility: 'sample',
              testCode: `
x = np.array([0.0, 1.0, 2.0])
y = np.array([3.0, 6.0, 9.0])
out = train_linear_gd(x, y, lr=0.1, steps=100)
assert out["final_loss"] < 0.05
`,
            },
            {
              id: '4.3-h1',
              name: 'Learns negative slopes cleanly',
              visibility: 'hidden',
              testCode: `
x = np.array([1.0, 2.0, 3.0])
y = -1.5 * x + 4.0
out = train_linear_gd(x, y, lr=0.05, steps=300)
assert abs(out["w"] - (-1.5)) < 0.1 and out["final_loss"] < 0.01
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Gradient Descent iteratively nudges weights downhill using `- lr * grad`.',
          'Learning rate balances convergence speed against oscillation/divergence.',
        ],
        reflection_prompt: 'What happens if you increase `lr` from `0.05` to `2.0` on this problem?',
      },
    },
    {
      id: '4.4',
      trackId: 'track-04',
      order: 4,
      code: '4.4',
      title: 'Convolutional Neural Networks (CNN) for Vision',
      subtitle: 'Sliding convolution kernels, stride, padding, pooling, and hierarchical visual features.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Medium',
      estMinutes: 24,
      theory: {
        intro:
          'Flattening a 256×256 image into an MLP destroys spatial neighborhood structure and explodes parameter counts. A **CNN** slides tiny reusable **kernels (filters)** (e.g. 3×3) across the image to detect edges in early layers, textures in middle layers, and whole objects in deep layers.',
        why_it_matters:
          'CNNs power medical imaging, self-driving perception, and satellite analysis—and **Transfer Learning** lets you reuse pretrained CNN backbones with tiny datasets.',
        history_brief:
          'LeNet (LeCun, 1998) and AlexNet (2012) ignited the modern Deep Learning revolution using GPU-accelerated convolutions.',
        visual_diagram_id: 'dl-cnn-kernel',
        key_rule: 'Output spatial size formula: `out = floor((input + 2*padding - kernel) / stride) + 1`.',
        syntax_breakdown: [
          { token: 'Conv2d', syntax: 'nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)', description: 'Slides 16 learned 3x3 filters over an RGB image.' },
          { token: 'MaxPool2d', syntax: 'nn.MaxPool2d(kernel_size=2)', description: 'Halves width & height while keeping strongest activations.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute the 2D convolution output size given `n`, `padding`, `kernel`, and `stride`.',
        codeTemplate: `out_size = (n + 2 * ___0___ - kernel) // ___1___ + 1`,
        blanks: [
          { id: 'b0', answer: 'padding', placeholder: 'pad' },
          { id: 'b1', answer: 'stride', placeholder: 'step' },
        ],
        wordBank: ['padding', 'stride', 'channels', 'pool', 'batch'],
        hint: 'Add `2 * padding`, subtract `kernel`, integer-divide by `stride`, then add `1`.',
        explanation: 'With `kernel=3, padding=1, stride=1`, `out_size == n` ("same" padding preserves image dimensions).',
      },
      challenge: {
        id: 'chal-4-4',
        difficulty_kyu: '4 Kyu',
        xp_reward: 220,
        title: '2D Convolution Filter & Output Size Engine',
        instructions:
          'Implement `conv_output_size(n, kernel, stride=1, padding=0)` and `valid_conv2d(image, kernel)` performing a real 2D sliding-window convolution (stride=1, padding=0).',
        requirements: [
          '`conv_output_size(n, kernel, stride=1, padding=0)` returns `(n + 2 * padding - kernel) // stride + 1`.',
          '`valid_conv2d(image, kernel)` slides `kernel` over `image` and computes `np.sum(patch * kernel)` at every valid `(r, c)` position.',
        ],
        starter_file_url: '/starters/track04_04_cnn.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 CNN Kernel Tests Pass',
        default_tasks: [
          'Implement the conv_output_size formula.',
          'Slide the 2D kernel over image patches and sum element-wise products.',
        ],
        starter_code: `import numpy as np

def conv_output_size(n, kernel, stride=1, padding=0):
    pass

def valid_conv2d(image, kernel):
    # Return 2D NumPy feature map of shape (H - kh + 1, W - kw + 1)
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.4-s1',
              name: 'Computes exact convolution output dimensions with stride & padding',
              visibility: 'sample',
              testCode: `
assert conv_output_size(28, kernel=3, stride=1, padding=1) == 28
assert conv_output_size(28, kernel=3, stride=2, padding=0) == 13
`,
            },
            {
              id: '4.4-s2',
              name: 'Slides 2x2 kernel over 3x3 image accurately',
              visibility: 'sample',
              testCode: `
img = np.array([[1, 2, 0], [0, 1, 3], [2, 1, 0]], dtype=float)
ker = np.array([[1, 0], [0, 1]], dtype=float)
out = valid_conv2d(img, ker)
assert out.shape == (2, 2)
assert np.allclose(out, [[2.0, 5.0], [1.0, 1.0]])
`,
            },
            {
              id: '4.4-h1',
              name: 'Detects vertical edge response cleanly',
              visibility: 'hidden',
              testCode: `
img = np.array([[0, 0, 10, 10], [0, 0, 10, 10], [0, 0, 10, 10]], dtype=float)
ker = np.array([[-1, 1], [-1, 1]], dtype=float)
out = valid_conv2d(img, ker)
assert out[0, 1] == 20.0 and out[0, 0] == 0.0
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Shared sliding kernels give CNNs translation equivariance with far fewer parameters than dense MLPs.',
          'Stride and pooling progressively shrink spatial size while deepening semantic features.',
        ],
        reflection_prompt: 'Why does a 3×3 filter with `padding=1, stride=1` keep the image size unchanged?',
      },
    },
    {
      id: '4.5',
      trackId: 'track-04',
      order: 5,
      code: '4.5',
      title: 'Sequence Models: RNN & LSTM',
      subtitle: 'Sequential order, hidden state memory h_t, vanishing gradients, and LSTM memory gates.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'Word order matters: *"Dog bites man"* ≠ *"Man bites dog"*. **Recurrent Neural Networks (RNNs)** process one timestep at a time, passing a **hidden state (`h_t`)** forward as short-term memory. **LSTMs** add a protected cell highway with **Forget, Input, and Output gates** so important memories survive long sequences without vanishing gradients.',
        why_it_matters:
          'Understanding sequential state `h_t` explains both time-series forecasting and why Transformers were later invented to escape sequential bottlenecks.',
        history_brief:
          'Hochreiter & Schmidhuber (1997) invented the LSTM, powering speech recognition and machine translation for two decades.',
        visual_diagram_id: 'dl-rnn-lstm',
        key_rule: 'Standard RNN update: `h_t = tanh(W_x * x_t + W_h * h_{t-1} + b)`; LSTM gates (`sigmoid` in `[0, 1]`) decide what to forget vs keep.',
        syntax_breakdown: [
          { token: 'Hidden State', syntax: 'h_t = np.tanh(w_x * x_t + w_h * h_prev + b)', description: 'Blends current input with previous memory.' },
          { token: 'Forget Gate', syntax: 'c_t = f_gate * c_prev + i_gate * candidate', description: 'Selectively retains long-term cell memory.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Update the recurrent hidden state `h` using `np.tanh` on current input and previous state.',
        codeTemplate: `h = np.___0___(w_x * x_t + w_h * ___1___ + b)`,
        blanks: [
          { id: 'b0', answer: 'tanh', placeholder: 'act' },
          { id: 'b1', answer: 'h', placeholder: 'prev' },
        ],
        wordBank: ['tanh', 'h', 'relu', 'x_t', 'softmax'],
        hint: 'Classic RNNs squash the combined input + previous hidden state `h` through `np.tanh`.',
        explanation: '`tanh` keeps hidden states bounded between `-1` and `+1` across timesteps.',
      },
      challenge: {
        id: 'chal-4-5',
        difficulty_kyu: '3 Kyu',
        xp_reward: 220,
        title: 'Recurrent Hidden State & LSTM Gate Stepper',
        instructions:
          'Implement `rnn_rollout(sequence, w_x, w_h, b)` returning the list of hidden states `[h_1, ..., h_T]` starting from `h_0 = 0.0`, and `lstm_cell_update(c_prev, forget_gate, input_gate, candidate)` returning the updated cell state.',
        requirements: [
          '`rnn_rollout` computes `h = float(np.tanh(w_x * x_t + w_h * h + b))` for each `x_t` in `sequence` and collects them.',
          '`lstm_cell_update` returns `float(forget_gate * c_prev + input_gate * candidate)`.',
        ],
        starter_file_url: '/starters/track04_05_rnn_lstm.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Sequence Tests Pass',
        default_tasks: [
          'Roll h forward across every x_t using np.tanh.',
          'Combine forget_gate * c_prev + input_gate * candidate for LSTM memory.',
        ],
        starter_code: `import numpy as np

def rnn_rollout(sequence, w_x, w_h, b):
    # Return list of hidden states starting from h = 0.0
    pass

def lstm_cell_update(c_prev, forget_gate, input_gate, candidate):
    # Return updated cell state c_t
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.5-s1',
              name: 'Rolls RNN hidden state cleanly across 3 timesteps',
              visibility: 'sample',
              testCode: `
states = rnn_rollout([1.0, 0.5, -0.5], w_x=0.8, w_h=0.5, b=0.0)
assert len(states) == 3
assert abs(states[0] - np.tanh(0.8)) < 1e-6
assert abs(states[1] - np.tanh(0.8 * 0.5 + 0.5 * states[0])) < 1e-6
`,
            },
            {
              id: '4.5-s2',
              name: 'LSTM forget gate=1 preserves old memory while input=0 ignores noise',
              visibility: 'sample',
              testCode: `
c_new = lstm_cell_update(c_prev=2.5, forget_gate=1.0, input_gate=0.0, candidate=99.0)
assert abs(c_new - 2.5) < 1e-6
`,
            },
            {
              id: '4.5-h1',
              name: 'LSTM forget gate=0 wipes old memory cleanly',
              visibility: 'hidden',
              testCode: `
c_new = lstm_cell_update(c_prev=10.0, forget_gate=0.0, input_gate=0.5, candidate=4.0)
assert abs(c_new - 2.0) < 1e-6
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'RNNs carry sequential context step-by-step via `h_t`, but struggle on very long sequences.',
          'LSTMs protect long-term memory using multiplicative Forget and Input gates.',
        ],
        reflection_prompt: 'Why is an RNN slower to train on GPUs than a Transformer?',
      },
    },
    {
      id: '4.6',
      trackId: 'track-04',
      order: 6,
      code: '4.6',
      title: 'Transformer & Self-Attention Architecture',
      subtitle: 'Tokens, embeddings, positional encoding, Query/Key/Value attention, and modern LLM backbones.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Hard',
      estMinutes: 26,
      theory: {
        intro:
          'The **Transformer** threw away sequential recurrence completely! Using **Scaled Dot-Product Self-Attention**, every token in a sentence looks at every other token **in parallel** via **Query (`Q`)**, **Key (`K`)**, and **Value (`V`)** vectors, adding **Positional Encoding** so order is preserved.',
        why_it_matters:
          'Transformers are the foundation of GPT, Gemini, Claude, Vision Transformers (ViT), and multimodal AI.',
        history_brief:
          'Vaswani et al. (2017) introduced "Attention Is All You Need", revolutionizing NLP and launching the LLM era.',
        visual_diagram_id: 'dl-transformer-attn',
        key_rule: '`Attention(Q, K, V) = softmax((Q @ K.T) / sqrt(d_k)) @ V` — dividing by `sqrt(d_k)` keeps Softmax gradients healthy.',
        syntax_breakdown: [
          { token: 'Scores', syntax: 'scores = (Q @ K.T) / np.sqrt(d_k)', description: 'Measures token-to-token relevance scaled by head dimension.' },
          { token: 'Weights', syntax: 'weights = softmax(scores, axis=-1)', description: 'Turns relevance scores into attention probabilities per token.' },
          { token: 'Context', syntax: 'output = weights @ V', description: 'Blends Value vectors weighted by attention.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Compute scaled dot-product attention scores between `Q` and `K`.',
        codeTemplate: `scores = (Q @ K.___0___) / np.___1___(d_k)`,
        blanks: [
          { id: 'b0', answer: 'T', placeholder: 'transp' },
          { id: 'b1', answer: 'sqrt', placeholder: 'scale' },
        ],
        wordBank: ['T', 'sqrt', 'log', 'sum', 'dot'],
        hint: 'Transpose `K` (`K.T`) and divide by `np.sqrt(d_k)`.',
        explanation: 'Scaling by `sqrt(d_k)` prevents huge dot products from saturating Softmax.',
      },
      challenge: {
        id: 'chal-4-6',
        difficulty_kyu: '3 Kyu',
        xp_reward: 260,
        title: 'Scaled Dot-Product Self-Attention in NumPy',
        instructions:
          'Implement `scaled_dot_product_attention(Q, K, V)` returning `(context, weights)` where `weights` is row-wise Softmax of `(Q @ K.T) / sqrt(d_k)` and `context = weights @ V`.',
        requirements: [
          'Extract `d_k = K.shape[-1]`.',
          'Compute `scores = (Q @ K.T) / np.sqrt(d_k)` and apply row-wise numerically stable Softmax (`axis=-1`).',
          'Compute `context = weights @ V` and return `(context, weights)`.',
        ],
        starter_file_url: '/starters/track04_06_attention.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Attention Tests Pass',
        default_tasks: [
          'Compute scaled scores (Q @ K.T) / np.sqrt(d_k).',
          'Apply stable Softmax along axis=-1 so each row sums to 1.0.',
          'Multiply weights @ V to produce contextual token embeddings.',
        ],
        starter_code: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    # Return (context, weights)
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.6-s1',
              name: 'Attention weight rows sum to 1.0 and preserve V shape',
              visibility: 'sample',
              testCode: `
Q = np.array([[1.0, 0.0], [0.0, 1.0]])
K = np.array([[1.0, 0.0], [0.0, 1.0]])
V = np.array([[10.0, 0.0], [0.0, 20.0]])
ctx, w = scaled_dot_product_attention(Q, K, V)
assert w.shape == (2, 2) and ctx.shape == (2, 2)
assert np.allclose(np.sum(w, axis=-1), [1.0, 1.0])
assert w[0, 0] > w[0, 1] and w[1, 1] > w[1, 0]
`,
            },
            {
              id: '4.6-s2',
              name: 'Strong matching key dominates output context vector',
              visibility: 'sample',
              testCode: `
Q = np.array([[10.0, 0.0]])
K = np.array([[10.0, 0.0], [0.0, 10.0]])
V = np.array([[1.0, 2.0], [9.0, 9.0]])
ctx, w = scaled_dot_product_attention(Q, K, V)
assert w[0, 0] > 0.99 and np.allclose(ctx[0], [1.0, 2.0], atol=0.1)
`,
            },
            {
              id: '4.6-h1',
              name: 'Supports rectangular (3, 4) Q/K and (3, 2) V matrices',
              visibility: 'hidden',
              testCode: `
Q = np.ones((3, 4))
K = np.ones((3, 4))
V = np.array([[3.0, 6.0], [3.0, 6.0], [3.0, 6.0]])
ctx, w = scaled_dot_product_attention(Q, K, V)
assert ctx.shape == (3, 2) and np.allclose(ctx[0], [3.0, 6.0])
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Self-Attention lets every token attend directly to any other token in O(1) sequential depth.',
          'Positional Encodings inject order information because pure attention is permutation-invariant.',
        ],
        reflection_prompt: 'Why is `sqrt(d_k)` scaling essential when embedding dimensions grow to 128 or 512?',
      },
    },
    {
      id: '4.7',
      trackId: 'track-04',
      order: 7,
      code: '4.7',
      title: 'Generative & Representation Models',
      subtitle: 'Autoencoders, Variational Autoencoders (VAE), and Diffusion denoising intuition.',
      categoryLabel: 'Deep Learning',
      difficulty: 'Medium',
      estMinutes: 22,
      theory: {
        intro:
          'Beyond classification, **Representation & Generative Models** learn compressed latent worlds. **Autoencoders** squeeze inputs through a bottleneck `z` to reconstruct them (great for anomaly detection), **VAEs** sample smooth latent spaces via `z = mu + sigma * eps`, and **Diffusion Models** learn to iteratively remove Gaussian noise to generate crisp images.',
        why_it_matters:
          'Autoencoders power industrial anomaly detection, while VAEs and Latent Diffusion power Stable Diffusion, image/video synthesis, and molecular design.',
        history_brief:
          'Kingma & Welling (2013) introduced the VAE reparameterization trick; Ho et al. (2020) made Denoising Diffusion (DDPM) the gold standard for image generation.',
        visual_diagram_id: 'dl-generative-latent',
        key_rule: 'VAE reparameterization (`z = mu + exp(0.5 * log_var) * eps`) keeps random sampling differentiable for backpropagation.',
        syntax_breakdown: [
          { token: 'VAE Sample', syntax: 'z = mu + np.exp(0.5 * log_var) * eps', description: 'Samples latent vector while keeping gradients intact.' },
          { token: 'Denoise Step', syntax: 'x_prev = x_t - step_scale * pred_noise', description: 'Subtracts predicted noise during Diffusion generation.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Complete the VAE reparameterization trick `z = mu + std * eps`.',
        codeTemplate: `std = np.exp(0.5 * log_var)\nz = ___0___ + std * ___1___`,
        blanks: [
          { id: 'b0', answer: 'mu', placeholder: 'mean' },
          { id: 'b1', answer: 'eps', placeholder: 'noise' },
        ],
        wordBank: ['mu', 'eps', 'var', 'sigma', 'loss'],
        hint: 'Shift by `mu` and scale random normal `eps` by `std`.',
        explanation: 'Moving randomness into `eps` allows gradients to flow smoothly through `mu` and `log_var`.',
      },
      challenge: {
        id: 'chal-4-7',
        difficulty_kyu: '3 Kyu',
        xp_reward: 230,
        title: 'VAE Latent Sampler & Anomaly Reconstruction Scorer',
        instructions:
          'Implement `vae_reparameterize(mu, log_var, eps)` and `detect_anomaly(x_orig, x_recon, threshold=0.25)` computing MSE reconstruction error and returning `(mse, is_anomaly)`.',
        requirements: [
          '`vae_reparameterize(mu, log_var, eps)` returns `mu + np.exp(0.5 * log_var) * eps`.',
          '`detect_anomaly(x_orig, x_recon, threshold=0.25)` computes `mse = float(np.mean((x_orig - x_recon) ** 2))` and returns `(mse, mse > threshold)`.',
        ],
        starter_file_url: '/starters/track04_07_generative.py',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'py_unit_test',
        passing_threshold: 100,
        passing_label: 'All 3 Generative & Latent Tests Pass',
        default_tasks: [
          'Implement the VAE reparameterization equation.',
          'Compute autoencoder MSE reconstruction error and flag anomalies > threshold.',
        ],
        starter_code: `import numpy as np

def vae_reparameterize(mu, log_var, eps):
    pass

def detect_anomaly(x_orig, x_recon, threshold=0.25):
    # Return (mse_float, is_anomaly_bool)
    pass
`,
        test_suite: {
          requiredPackages: ['numpy'],
          pyTests: [
            {
              id: '4.7-s1',
              name: 'Computes exact VAE latent sample z',
              visibility: 'sample',
              testCode: `
z = vae_reparameterize(np.array([1.0, 2.0]), np.array([0.0, 0.0]), np.array([0.5, -0.5]))
assert np.allclose(z, [1.5, 1.5])
`,
            },
            {
              id: '4.7-s2',
              name: 'Flags high reconstruction error as anomaly',
              visibility: 'sample',
              testCode: `
mse_ok, flag_ok = detect_anomaly(np.array([1.0, 2.0]), np.array([1.1, 1.9]), threshold=0.25)
mse_bad, flag_bad = detect_anomaly(np.array([1.0, 2.0]), np.array([3.0, 0.0]), threshold=0.25)
assert flag_ok is False and flag_bad is True and mse_bad > 3.0
`,
            },
            {
              id: '4.7-h1',
              name: 'Scales non-zero log_var properly with exp(0.5 * log_var)',
              visibility: 'hidden',
              testCode: `
z = vae_reparameterize(np.array([0.0]), np.array([np.log(9.0)]), np.array([2.0]))
assert np.allclose(z, [6.0])
`,
            },
          ],
        },
      },
      summary: {
        key_takeaways: [
          'Autoencoders flag anomalies whenever reconstruction MSE spikes.',
          'VAEs learn smooth latent distributions, and Diffusion models generate detail by iterative denoising.',
        ],
        reflection_prompt: 'Why does an Autoencoder trained only on normal factory images fail to reconstruct a defective part?',
      },
    },
    {
      id: '4.8',
      trackId: 'track-04',
      order: 8,
      code: '4.8',
      title: 'Deep Learning Final Exam: Non-Linear Moons Classifier',
      subtitle: 'Capstone Assessment: train a PyTorch MLP with ReLU in Colab and submit predictions.csv (F1 >= 0.88).',
      categoryLabel: 'Deep Learning',
      difficulty: 'Hard',
      estMinutes: 40,
      theory: {
        intro:
          'Put your Deep Learning mastery to the test on the classic non-linear **Two Moons** dataset! A straight linear classifier cannot separate interleaved crescent moons—you need a multi-layer Neural Network with non-linear activations trained with Gradient Descent / Adam.',
        why_it_matters:
          'Passing `F1 >= 0.88` on unseen moons proves you can train, validate, and export real neural network predictions end-to-end.',
        history_brief:
          'Two Moons is the canonical benchmark demonstrating why hidden layers + non-linear activations break the linear barrier.',
        visual_diagram_id: 'dl-capstone-moons',
        key_rule: 'Standardize features, use ReLU hidden layers + Adam optimizer, and verify F1 on validation before exporting `predictions.csv`.',
        syntax_breakdown: [
          { token: 'PyTorch MLP', syntax: 'nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 1))', description: 'Non-linear 2-layer neural classifier.' },
          { token: 'Adam Step', syntax: 'loss.backward(); optimizer.step(); optimizer.zero_grad()', description: 'Executes backpropagation and parameter update.' },
        ],
      },
      syntaxCheck: {
        prompt: 'Complete the PyTorch training step: compute gradients with `.backward()` and update weights with `.step()`.',
        codeTemplate: `optimizer.zero_grad()\nloss.___0___()\noptimizer.___1___()`,
        blanks: [
          { id: 'b0', answer: 'backward', placeholder: 'grad' },
          { id: 'b1', answer: 'step', placeholder: 'update' },
        ],
        wordBank: ['backward', 'step', 'forward', 'fit', 'eval'],
        hint: 'PyTorch computes gradients via `loss.backward()` and updates weights via `optimizer.step()`.',
        explanation: 'Always zero gradients before the next batch so gradients do not accumulate unintentionally.',
      },
      challenge: {
        id: 'chal-4-8',
        difficulty_kyu: '2 Kyu',
        xp_reward: 500,
        is_final_exam: true,
        title: 'Deep Learning Final Exam: Non-Linear Moons (F1 >= 0.88)',
        instructions:
          'Download train.csv & test_X.csv, train a PyTorch MLP (with ReLU + Adam) in Google Colab, and upload predictions.csv (80 rows: id, prediction in {0, 1}) beating F1 >= 0.88.',
        requirements: [
          'Download `train.csv` and `test_X.csv`.',
          'Train a non-linear neural network in Colab (PyTorch MLP).',
          'Upload `predictions.csv` achieving F1-Score >= 0.88.',
        ],
        starter_file_url: '/starters/track04_04_moons_exam.ipynb',
        colab_notebook_url: 'https://colab.research.google.com/',
        validation_mode: 'csv_metric_eval',
        passing_threshold: 0.88,
        passing_label: 'F1-Score >= 0.88 (80 test rows)',
        default_tasks: [
          'Download moons train.csv & test_X.csv.',
          'Train a PyTorch MLP with ReLU + Adam in Colab.',
          'Upload predictions.csv and beat F1 >= 0.88.',
        ],
        starter_code: `import pandas as pd
import torch
import torch.nn as nn

train = pd.read_csv("track04_moons_train.csv")
test_X = pd.read_csv("track04_moons_test_X.csv")

X_tr = torch.tensor(train[["x1", "x2"]].values, dtype=torch.float32)
y_tr = torch.tensor(train["label"].values, dtype=torch.float32).unsqueeze(1)
X_te = torch.tensor(test_X[["x1", "x2"]].values, dtype=torch.float32)

model = nn.Sequential(nn.Linear(2, 32), nn.ReLU(), nn.Linear(32, 16), nn.ReLU(), nn.Linear(16, 1))
opt = torch.optim.Adam(model.parameters(), lr=0.02)
loss_fn = nn.BCEWithLogitsLoss()

for _ in range(300):
    opt.zero_grad()
    loss = loss_fn(model(X_tr), y_tr)
    loss.backward()
    opt.step()

with torch.no_grad():
    preds = (torch.sigmoid(model(X_te)) >= 0.5).int().squeeze().numpy()

pd.DataFrame({"id": test_X["id"], "prediction": preds}).to_csv("predictions.csv", index=False)
`,
        test_suite: {
          csvSpec: {
            taskType: 'binary_classification',
            idColumnCandidates: ['id'],
            targetColumnCandidates: ['prediction', 'label', 'y_pred', 'pred'],
            primaryMetric: 'f1',
            thresholdOperator: '>=',
            passingThreshold: 0.88,
            baselineMetric: 0.72,
            groundTruth: TRACK04_EXAM_TRUTH,
            trainCsvUrl: '/datasets/track04_moons_train.csv',
            testFeaturesCsvUrl: '/datasets/track04_moons_test_X.csv',
            sampleCsvHint: 'id,prediction\n1,0\n2,1',
          },
        },
      },
      summary: {
        key_takeaways: [
          'You built neural networks from raw math foundations all the way to Transformers, VAEs, and PyTorch!',
          'Next up: Track 05 — Agentic AI, where LLMs gain memory, tools, and multi-agent collaboration.',
        ],
        reflection_prompt: 'Why did adding ReLU hidden layers unlock > 0.88 F1 on the Moons dataset?',
      },
    },
  ],
};
